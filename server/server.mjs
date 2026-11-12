// ぐるぐる API — Google 로그인 · 프로필(사진) · 역할(학생/선생) · 관리자 승인 · 실력 테스트 · 매칭 · 일정 · 채팅
// 의존성 없음: Node 22.13+ (node:sqlite, node:crypto)
//
// 환경 변수
//   GOOGLE_CLIENT_ID  (필수) Google OAuth 웹 클라이언트 ID
//   ADMIN_EMAILS      관리자 이메일 (쉼표 구분) — 선생님 승인 권한
//   ORIGINS           허용 Origin (쉼표 구분, 예: https://guruguru.app)
//   SITE_DIR          사이트 폴더(읽기 전용 마운트) — 교사용 지도안 PDF 를 선생님에게만 내보냄
//   ※ config.json(서버 코드 옆, CI 가 GitHub Environment 변수로 생성)이 있으면 그 값을 우선 사용
//   PORT=8787  DB_PATH=/data/guruguru.db  COOKIE_SECURE=1  TRUST_PROXY=1
import http from 'node:http';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';

// CI 가 GitHub Environment 변수(GOOGLE_CLIENT_ID·ADMIN_EMAILS)로 만든 config.json 을 우선 적용
const FILE_CFG = (() => { try { return JSON.parse(fs.readFileSync(new URL('./config.json', import.meta.url), 'utf8')); } catch { return {}; } })();
const env = (k, d = '') => String(FILE_CFG[k] ?? process.env[k] ?? d).trim();
const CFG = {
  port: +env('PORT', '8787'),
  db: env('DB_PATH', '/data/guruguru.db'),
  clientId: env('GOOGLE_CLIENT_ID'),
  admins: env('ADMIN_EMAILS').toLowerCase().split(',').map(s => s.trim()).filter(Boolean),
  origins: env('ORIGINS').split(',').map(s => s.trim()).filter(Boolean),
  secure: env('COOKIE_SECURE', '1') !== '0',
  trustProxy: env('TRUST_PROXY', '1') !== '0',
  site: env('SITE_DIR', '/site'),
  cookie: 'gg_sid',
  sessionDays: 180,
};
const JWKS_URL = env('GOOGLE_JWKS_URL', 'https://www.googleapis.com/oauth2/v3/certs');

/* ---------------- DB ---------------- */
fs.mkdirSync(path.dirname(CFG.db), { recursive: true });
const db = new DatabaseSync(CFG.db);
db.exec(`
PRAGMA journal_mode=WAL;
PRAGMA foreign_keys=ON;
CREATE TABLE IF NOT EXISTS users(
  id INTEGER PRIMARY KEY,
  sub TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  google_name TEXT, picture TEXT,
  name TEXT,
  role TEXT CHECK(role IN ('student','teacher')),
  teacher_status TEXT NOT NULL DEFAULT 'none' CHECK(teacher_status IN ('none','pending','approved','rejected')),
  level TEXT, goal TEXT, bio TEXT, lang TEXT,
  created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL, last_login INTEGER
);
CREATE TABLE IF NOT EXISTS sessions(
  token_hash TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at INTEGER NOT NULL, expires_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS sessions_user ON sessions(user_id);
CREATE TABLE IF NOT EXISTS tests(
  id INTEGER PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  step INTEGER NOT NULL, score INTEGER NOT NULL, total INTEGER NOT NULL, at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS tests_user ON tests(user_id, at);
CREATE TABLE IF NOT EXISTS matches(
  id INTEGER PRIMARY KEY,
  student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  teacher_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK(status IN ('pending','accepted','declined','ended','canceled')),
  created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL, last_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS matches_s ON matches(student_id);
CREATE INDEX IF NOT EXISTS matches_t ON matches(teacher_id);
CREATE TABLE IF NOT EXISTS messages(
  id INTEGER PRIMARY KEY,
  match_id INTEGER NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  sender_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  kind TEXT NOT NULL DEFAULT 'text', body TEXT NOT NULL, at INTEGER NOT NULL, read_at INTEGER
);
CREATE INDEX IF NOT EXISTS messages_m ON messages(match_id, id);
CREATE TABLE IF NOT EXISTS slots(
  id INTEGER PRIMARY KEY,
  teacher_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  start INTEGER NOT NULL, dur INTEGER NOT NULL,
  student_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  match_id INTEGER REFERENCES matches(id) ON DELETE SET NULL,
  lesson_no INTEGER, note TEXT, booked_at INTEGER, created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS slots_t ON slots(teacher_id, start);
CREATE INDEX IF NOT EXISTS slots_s ON slots(student_id, start);
`);
db.exec(`CREATE TABLE IF NOT EXISTS progress(user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE, data TEXT NOT NULL, updated_at INTEGER NOT NULL);`);
const addCol = (t, c, d) => { if (!db.prepare(`PRAGMA table_info(${t})`).all().some(x => x.name === c)) db.exec(`ALTER TABLE ${t} ADD COLUMN ${c} ${d}`); };
addCol('users', 'avatar', 'TEXT');
for (const c of ['meet_url', 'modes', 'places', 'intro', 'tags']) addCol('users', c, 'TEXT');
for (const c of ['mode', 'place', 'url']) addCol('slots', c, 'TEXT');
const AV_DIR = path.join(path.dirname(CFG.db), 'avatars');
fs.mkdirSync(AV_DIR, { recursive: true });
const q = {
  userBySub: db.prepare('SELECT * FROM users WHERE sub=?'),
  userById: db.prepare('SELECT * FROM users WHERE id=?'),
  insUser: db.prepare('INSERT INTO users(sub,email,google_name,picture,name,created_at,updated_at,last_login) VALUES(?,?,?,?,?,?,?,?)'),
  loginUser: db.prepare('UPDATE users SET email=?,google_name=?,picture=?,last_login=? WHERE id=?'),
  saveProfile: db.prepare('UPDATE users SET name=?,role=?,teacher_status=?,level=?,goal=?,bio=?,lang=?,updated_at=? WHERE id=?'),
  setStatus: db.prepare('UPDATE users SET role=?,teacher_status=?,updated_at=? WHERE id=?'),
  delUser: db.prepare('DELETE FROM users WHERE id=?'),
  allUsers: db.prepare('SELECT * FROM users ORDER BY (teacher_status=\'pending\') DESC, created_at DESC'),
  insSess: db.prepare('INSERT INTO sessions(token_hash,user_id,created_at,expires_at) VALUES(?,?,?,?)'),
  sess: db.prepare('SELECT s.expires_at, u.* FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=?'),
  delSess: db.prepare('DELETE FROM sessions WHERE token_hash=?'),
  gcSess: db.prepare('DELETE FROM sessions WHERE expires_at<?'),
  getProg: db.prepare('SELECT data,updated_at FROM progress WHERE user_id=?'),
  putProg: db.prepare('INSERT INTO progress(user_id,data,updated_at) VALUES(?,?,?) ON CONFLICT(user_id) DO UPDATE SET data=excluded.data,updated_at=excluded.updated_at'),
  saveTeach: db.prepare('UPDATE users SET meet_url=?,modes=?,intro=?,tags=?,updated_at=? WHERE id=?'),
  savePlaces: db.prepare('UPDATE users SET places=?,updated_at=? WHERE id=?'),
  anyMatch: db.prepare("SELECT * FROM matches WHERE student_id=? AND teacher_id=? AND status IN ('accepted','ended') ORDER BY id DESC LIMIT 1"),
  setAvatar: db.prepare('UPDATE users SET avatar=?,updated_at=? WHERE id=?'),
  insTest: db.prepare('INSERT INTO tests(user_id,step,score,total,at) VALUES(?,?,?,?,?)'),
  lastTest: db.prepare('SELECT step,score,total,at FROM tests WHERE user_id=? ORDER BY at DESC, id DESC LIMIT 1'),
  testsToday: db.prepare('SELECT COUNT(*) n FROM tests WHERE user_id=? AND at>?'),
  teachers: db.prepare("SELECT * FROM users WHERE role='teacher' AND teacher_status='approved' AND id<>? ORDER BY last_login DESC LIMIT 200"),
  match: db.prepare('SELECT * FROM matches WHERE id=?'),
  activeMatch: db.prepare("SELECT * FROM matches WHERE student_id=? AND teacher_id=? AND status IN ('pending','accepted') ORDER BY id DESC LIMIT 1"),
  myMatches: db.prepare('SELECT * FROM matches WHERE student_id=? OR teacher_id=? ORDER BY last_at DESC LIMIT 200'),
  reqToday: db.prepare('SELECT COUNT(*) n FROM matches WHERE student_id=? AND created_at>?'),
  insMatch: db.prepare("INSERT INTO matches(student_id,teacher_id,status,created_at,updated_at,last_at) VALUES(?,?,'pending',?,?,?)"),
  setMatch: db.prepare('UPDATE matches SET status=?,updated_at=?,last_at=? WHERE id=?'),
  touchMatch: db.prepare('UPDATE matches SET last_at=? WHERE id=?'),
  insMsg: db.prepare('INSERT INTO messages(match_id,sender_id,kind,body,at) VALUES(?,?,?,?,?)'),
  msgsAfter: db.prepare('SELECT * FROM messages WHERE match_id=? AND id>? ORDER BY id LIMIT 300'),
  msgsLast: db.prepare('SELECT * FROM (SELECT * FROM messages WHERE match_id=? ORDER BY id DESC LIMIT 200) ORDER BY id'),
  lastMsg: db.prepare('SELECT * FROM messages WHERE match_id=? ORDER BY id DESC LIMIT 1'),
  unread: db.prepare('SELECT COUNT(*) n FROM messages WHERE match_id=? AND sender_id IS NOT ? AND read_at IS NULL'),
  unreadAll: db.prepare("SELECT COUNT(*) n FROM messages m JOIN matches x ON x.id=m.match_id WHERE (x.student_id=?1 OR x.teacher_id=?1) AND m.sender_id IS NOT ?1 AND m.read_at IS NULL"),
  markRead: db.prepare('UPDATE messages SET read_at=? WHERE match_id=? AND sender_id IS NOT ? AND read_at IS NULL'),
  slot: db.prepare('SELECT * FROM slots WHERE id=?'),
  insSlot: db.prepare('INSERT INTO slots(teacher_id,start,dur,created_at,mode,place,url) VALUES(?,?,?,?,?,?,?)'),
  overlap: db.prepare('SELECT COUNT(*) n FROM slots WHERE teacher_id=? AND start<? AND start+dur*60>?'),
  futureCount: db.prepare('SELECT COUNT(*) n FROM slots WHERE teacher_id=? AND start>?'),
  freeCount: db.prepare('SELECT COUNT(*) n FROM slots WHERE teacher_id=? AND start>? AND student_id IS NULL'),
  teacherSlots: db.prepare('SELECT * FROM slots WHERE teacher_id=? AND start+dur*60>? ORDER BY start LIMIT 300'),
  freeSlots: db.prepare('SELECT * FROM slots WHERE teacher_id=? AND start>? AND student_id IS NULL ORDER BY start LIMIT 300'),
  delSlot: db.prepare('DELETE FROM slots WHERE id=?'),
  book: db.prepare('UPDATE slots SET student_id=?,match_id=?,booked_at=? WHERE id=? AND student_id IS NULL'),
  unbook: db.prepare('UPDATE slots SET student_id=NULL,match_id=NULL,booked_at=NULL,lesson_no=NULL,note=NULL WHERE id=?'),
  slotInfo: db.prepare('UPDATE slots SET lesson_no=?,note=? WHERE id=?'),
  schedule: db.prepare('SELECT * FROM slots WHERE (teacher_id=?1 OR student_id=?1) AND student_id IS NOT NULL AND start+dur*60>? ORDER BY start LIMIT 100'),
  matchFuture: db.prepare('SELECT * FROM slots WHERE match_id=? AND start>?'),
  nextWith: db.prepare('SELECT start,dur,lesson_no FROM slots WHERE match_id=? AND start+dur*60>? ORDER BY start LIMIT 1'),
};
const now = () => Math.floor(Date.now() / 1000);
const sha = s => crypto.createHash('sha256').update(s).digest('hex');

/* ---------------- Google ID token ---------------- */
let jwks = { keys: [], exp: 0 };
async function googleKeys(force) {
  if (!force && jwks.exp > Date.now() && jwks.keys.length) return jwks.keys;
  const r = await fetch(JWKS_URL);
  if (!r.ok) throw new Error('jwks ' + r.status);
  const m = /max-age=(\d+)/.exec(r.headers.get('cache-control') || '');
  const j = await r.json();
  jwks = { keys: j.keys || [], exp: Date.now() + (m ? +m[1] : 3600) * 1000 };
  return jwks.keys;
}
const b64u = s => Buffer.from(s.replace(/-/g, '+').replace(/_/g, '/'), 'base64');
export async function verifyGoogle(token, aud) {
  const parts = String(token || '').split('.');
  if (parts.length !== 3) throw new Error('format');
  const head = JSON.parse(b64u(parts[0]).toString());
  const body = JSON.parse(b64u(parts[1]).toString());
  if (head.alg !== 'RS256') throw new Error('alg');
  let jwk = (await googleKeys()).find(k => k.kid === head.kid);
  if (!jwk) jwk = (await googleKeys(true)).find(k => k.kid === head.kid);
  if (!jwk) throw new Error('kid');
  const ok = crypto.verify('RSA-SHA256', Buffer.from(parts[0] + '.' + parts[1]), crypto.createPublicKey({ key: jwk, format: 'jwk' }), b64u(parts[2]));
  if (!ok) throw new Error('sig');
  if (!['accounts.google.com', 'https://accounts.google.com'].includes(body.iss)) throw new Error('iss');
  if (body.aud !== aud) throw new Error('aud');
  if (!(body.exp > now() - 30)) throw new Error('exp');
  if (!body.sub || !body.email || body.email_verified === false || body.email_verified === 'false') throw new Error('email');
  return body;
}

/* ---------------- helpers ---------------- */
const isAdmin = u => !!u && CFG.admins.includes(String(u.email).toLowerCase());
const view = u => (isAdmin(u) || (u.role === 'teacher' && u.teacher_status === 'approved')) ? 'teacher' : 'student';
const picture = u => u.avatar ? `/api/avatar/${u.avatar}` : (u.picture || '');
const testOf = id => { const t = q.lastTest.get(id); return t ? { step: t.step, score: t.score, total: t.total, at: t.at } : null; };
// 상대방에게 보이는 정보(이메일 제외)
const js = (v, d) => { try { return v ? JSON.parse(v) : d; } catch { return d; } };
const teachInfo = u => u.role === 'teacher' ? { modes: u.modes || 'online', places: js(u.places, []), intro: u.intro || '', tags: (u.tags || '').split(',').filter(Boolean) } : {};
const peer = u => u ? ({ id: u.id, name: u.name || u.google_name || '', picture: picture(u), role: u.role, level: u.level || '', goal: u.goal || '', bio: u.bio || '', lang: u.lang || '', test: u.role === 'student' ? testOf(u.id) : null, ...teachInfo(u) }) : { id: 0, name: '—', picture: '' };
const pub = u => ({
  id: u.id, email: u.email, name: u.name || u.google_name || '', picture: picture(u), customPicture: !!u.avatar, test: testOf(u.id),
  role: u.role, teacherStatus: u.teacher_status, level: u.level || '', goal: u.goal || '', bio: u.bio || '', lang: u.lang || '',
  profileDone: !!(u.role && u.name), view: view(u), admin: isAdmin(u), meetUrl: u.meet_url || '', ...teachInfo(u),
});
const adminRow = u => ({ ...pub(u), createdAt: u.created_at, lastLogin: u.last_login });

function cookies(req) {
  const o = {};
  for (const p of (req.headers.cookie || '').split(';')) { const i = p.indexOf('='); if (i > 0) o[p.slice(0, i).trim()] = decodeURIComponent(p.slice(i + 1).trim()); }
  return o;
}
function setCookie(res, val, maxAge) {
  res.setHeader('Set-Cookie', `${CFG.cookie}=${val}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${CFG.secure ? '; Secure' : ''}`);
}
function currentUser(req) {
  const tok = cookies(req)[CFG.cookie];
  if (!tok || tok.length > 100) return null;
  const row = q.sess.get(sha(tok));
  if (!row || row.expires_at < now()) return null;
  return row;
}
function send(res, code, obj, extra = {}) {
  const body = obj === undefined ? '' : JSON.stringify(obj);
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', ...extra });
  res.end(body);
}
async function readRaw(req, max = 16384) {
  let size = 0; const chunks = [];
  // 너무 크면 끝까지 읽고 버린 뒤 413 (도중에 끊으면 클라이언트가 응답을 못 받음). 프록시가 1MB 로 상한
  for await (const c of req) { size += c.length; if (size <= max) chunks.push(c); else if (size > max * 8) { req.destroy(); break; } }
  if (size > max) throw Object.assign(new Error('too large'), { code: 413 });
  return Buffer.concat(chunks);
}
const readBody = async (req, max) => (await readRaw(req, max)).toString();
async function readJson(req) {
  if (!/^application\/json/i.test(req.headers['content-type'] || '')) throw Object.assign(new Error('content-type'), { code: 415 });
  const txt = await readBody(req);
  try { return JSON.parse(txt || '{}'); } catch { throw Object.assign(new Error('json'), { code: 400 }); }
}
const str = (v, max) => String(v ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, max);
const ip = req => (CFG.trustProxy && (req.headers['x-real-ip'] || String(req.headers['x-forwarded-for'] || '').split(',').pop().trim())) || req.socket.remoteAddress || '';

// 간단한 IP 별 rate limit (로그인 시도)
const hits = new Map();
function limited(key, max, winSec) {
  const t = Date.now(), h = hits.get(key) || { n: 0, t };
  if (t - h.t > winSec * 1000) { h.n = 0; h.t = t; }
  h.n++; hits.set(key, h);
  if (hits.size > 5000) for (const [k, v] of hits) if (t - v.t > winSec * 1000) hits.delete(k);
  return h.n > max;
}

const LEVELS = ['zero', 'hangul', 'beginner', 'intermediate', 'advanced'];

async function loginWith(credential, res) {
  const g = await verifyGoogle(credential, CFG.clientId);
  const t = now();
  let user = q.userBySub.get(g.sub);
  if (!user) { q.insUser.run(g.sub, g.email, str(g.name, 80), str(g.picture, 500), null, t, t, t); user = q.userBySub.get(g.sub); }
  else { q.loginUser.run(g.email, str(g.name, 80), str(g.picture, 500), t, user.id); user = q.userById.get(user.id); }
  const tok = crypto.randomBytes(32).toString('base64url');
  q.insSess.run(sha(tok), user.id, t, t + CFG.sessionDays * 86400);
  if (Math.random() < 0.05) q.gcSess.run(t);
  setCookie(res, tok, CFG.sessionDays * 86400);
  return user;
}

/* ---------------- 실시간 알림 (SSE) ---------------- */
const subs = new Map(); // userId -> Set<res>
function emit(uid, ev) {
  const set = subs.get(uid); if (!set) return;
  const line = `data: ${JSON.stringify(ev)}\n\n`;
  for (const r of set) { try { r.write(line); } catch { } }
}
function sse(req, res, me) {
  const set = subs.get(me.id) || new Set();
  if (set.size >= 6) { const old = set.values().next().value; set.delete(old); try { old.end(); } catch { } }
  res.writeHead(200, { 'Content-Type': 'text/event-stream; charset=utf-8', 'Cache-Control': 'no-store', 'X-Accel-Buffering': 'no', Connection: 'keep-alive' });
  res.write('retry: 5000\n\n');
  set.add(res); subs.set(me.id, set);
  const ping = setInterval(() => { try { res.write(': ping\n\n'); } catch { } }, 25000);
  req.on('close', () => { clearInterval(ping); set.delete(res); if (!set.size) subs.delete(me.id); });
}

/* ---------------- 매칭 · 일정 · 채팅 ---------------- */
const isStudentUser = u => u.role === 'student';
const isTeacherUser = u => u.role === 'teacher' && u.teacher_status === 'approved';
const sideOf = (m, me) => m.student_id === me.id ? 'student' : m.teacher_id === me.id ? 'teacher' : null;
const otherId = (m, me) => m.student_id === me.id ? m.teacher_id : m.student_id;
const msgOut = x => ({ id: x.id, from: x.sender_id, kind: x.kind, body: x.kind === 'sys' ? JSON.parse(x.body) : x.body, at: x.at, read: !!x.read_at });
function matchOut(m, me) {
  const lm = q.lastMsg.get(m.id);
  return { id: m.id, status: m.status, side: sideOf(m, me), peer: peer(q.userById.get(otherId(m, me))), createdAt: m.created_at, lastAt: m.last_at,
    unread: q.unread.get(m.id, me.id).n, last: lm ? msgOut(lm) : null, next: q.nextWith.get(m.id, now()) || null };
}
function slotOut(s, me) {
  const mine = s.teacher_id === me.id;
  const party = mine || s.student_id === me.id;
  return { id: s.id, start: s.start, dur: s.dur, booked: !!s.student_id, mine, matchId: s.match_id || null, lessonNo: s.lesson_no || null, note: s.note || '',
    mode: s.mode || 'online', place: js(s.place, null), url: party && (s.mode || 'online') === 'online' ? (s.url || '') : '',
    with: s.student_id ? peer(q.userById.get(mine ? s.student_id : s.teacher_id)) : null };
}
// 시스템 메시지(예약·취소·수락 등)를 대화에 남기고 양쪽에 알림
function sysMsg(m, actorId, data) {
  const t = now();
  const r = q.insMsg.run(m.id, actorId, 'sys', JSON.stringify(data), t);
  q.touchMatch.run(t, m.id);
  const ev = { t: 'msg', matchId: m.id, id: Number(r.lastInsertRowid) };
  emit(m.student_id, ev); emit(m.teacher_id, ev);
}
const IMG = [['jpg', 'image/jpeg', b => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff], ['png', 'image/png', b => b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))], ['webp', 'image/webp', b => b.subarray(0, 4).toString() === 'RIFF' && b.subarray(8, 12).toString() === 'WEBP']];
const rmAvatar = f => { if (f && /^[\w.-]+$/.test(f)) try { fs.unlinkSync(path.join(AV_DIR, f)); } catch { } };
const DAY = 86400;
function cleanPlace(p) {
  if (!p || typeof p !== 'object') return null;
  const lat = +p.lat, lng = +p.lng, name = str(p.name, 60), addr = str(p.addr, 200);
  if (!name || !(lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180)) return null;
  return { name, addr, lat: Math.round(lat * 1e6) / 1e6, lng: Math.round(lng * 1e6) / 1e6 };
}

/* ---------------- routes ---------------- */
async function handle(req, res) {
  const u = new URL(req.url, 'http://x');
  const p = u.pathname.replace(/\/+$/, '') || '/';
  const m = req.method;

  // Google 리디렉트 로그인(홈 화면 앱용): accounts.google.com 이 form POST 로 보내므로 Origin 검사 대신 g_csrf_token 이중 제출 확인
  if (p === '/api/auth/google/redirect' && m === 'POST') {
    const back = (h) => { res.writeHead(303, { Location: '/' + h, 'Cache-Control': 'no-store' }); res.end(); };
    if (limited('g:' + ip(req), 30, 300) || !CFG.clientId) return back('#/login-error');
    if (!/^application\/x-www-form-urlencoded/i.test(req.headers['content-type'] || '')) return back('#/login-error');
    const f = new URLSearchParams(await readBody(req));
    const ck = cookies(req).g_csrf_token, bt = f.get('g_csrf_token');
    if (!bt || (ck && ck !== bt)) return back('#/login-error');
    try { const user = await loginWith(f.get('credential'), res); return back(user ? '#/' : '#/login-error'); }
    catch { return back('#/login-error'); }
  }

  if (m !== 'GET' && m !== 'HEAD') {
    const o = req.headers.origin;
    if (CFG.origins.length && o && !CFG.origins.includes(o)) return send(res, 403, { error: 'origin' });
    if (CFG.origins.length && !o && !req.headers['sec-fetch-site']?.startsWith('same')) return send(res, 403, { error: 'origin' });
  }

  if (p === '/api/health') return send(res, 200, { ok: true });
  if (p === '/api/config' && m === 'GET') return send(res, 200, { googleClientId: CFG.clientId, auth: !!CFG.clientId });

  if (p === '/api/auth/google' && m === 'POST') {
    if (limited('g:' + ip(req), 30, 300)) return send(res, 429, { error: 'rate' });
    if (!CFG.clientId) return send(res, 503, { error: 'not configured' });
    const b = await readJson(req);
    let user;
    try { user = await loginWith(b.credential, res); }
    catch (e) { return send(res, 401, { error: 'invalid token', why: e.message }); }
    return send(res, 200, pub(user));
  }

  if (p === '/api/auth/logout' && m === 'POST') {
    const tok = cookies(req)[CFG.cookie];
    if (tok) q.delSess.run(sha(tok));
    setCookie(res, '', 0);
    return send(res, 200, { ok: true });
  }

  // 프로필 사진(공개, 파일명에 무작위 값 → 오래 캐시)
  const av = /^\/api\/avatar\/(\d+-[A-Za-z0-9_-]{8,24}\.(jpg|png|webp))$/.exec(p);
  if (av && (m === 'GET' || m === 'HEAD')) {
    const f = path.join(AV_DIR, av[1]);
    let st; try { st = fs.statSync(f); } catch { return send(res, 404, { error: 'not found' }); }
    res.writeHead(200, { 'Content-Type': IMG.find(x => x[0] === av[2])[1], 'Content-Length': st.size, 'Cache-Control': 'public, max-age=31536000, immutable', 'X-Content-Type-Options': 'nosniff' });
    if (m === 'HEAD') return res.end();
    return fs.createReadStream(f).pipe(res);
  }

  const me = currentUser(req);

  // nginx auth_request 용: 선생님(승인됨)만 204
  if (p === '/api/auth/teacher') {
    if (!me) return send(res, 401);
    return send(res, view(me) === 'teacher' ? 204 : 403);
  }

  // 교사용 지도안 PDF: NPM 이 /pdf/*-guide.pdf 를 이쪽으로 보냄 → 승인된 선생님만
  const gm = /^\/pdf\/((?:l\d{1,3}|step\d)-guide\.pdf)$/.exec(p);
  if (gm && (m === 'GET' || m === 'HEAD')) {
    if (!me) return send(res, 401, { error: 'login' });
    if (view(me) !== 'teacher') return send(res, 403, { error: 'teacher only' });
    const f = path.join(CFG.site, 'pdf', gm[1]);
    let st; try { st = fs.statSync(f); } catch { return send(res, 404, { error: 'not found' }); }
    res.writeHead(200, { 'Content-Type': 'application/pdf', 'Content-Length': st.size, 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff' });
    if (m === 'HEAD') return res.end();
    return fs.createReadStream(f).pipe(res);
  }

  if (p === '/api/me') {
    if (!me) return send(res, 401, { error: 'login' });
    if (m === 'GET') return send(res, 200, pub(me));
    if (m === 'PUT') {
      const b = await readJson(req);
      const name = str(b.name, 40);
      const role = b.role === 'teacher' ? 'teacher' : b.role === 'student' ? 'student' : null;
      if (!name || !role) return send(res, 400, { error: 'name and role required' });
      let status = me.teacher_status;
      if (role === 'teacher') { if (status !== 'approved') status = isAdmin(me) ? 'approved' : 'pending'; }
      else status = 'none';
      const level = LEVELS.includes(b.level) ? b.level : null;
      const lang = b.lang === 'ko' || b.lang === 'ja' ? b.lang : null;
      q.saveProfile.run(name, role, status, level, str(b.goal, 200), str(b.bio, 200), lang, now(), me.id);
      if (role === 'teacher') {
        const mu = str(b.meetUrl, 300), modes = ['online', 'offline', 'both'].includes(b.modes) ? b.modes : (me.modes || 'online');
        const tags = (Array.isArray(b.tags) ? b.tags : String(b.tags || '').split(/[,、，]/)).map(t => str(t, 20)).filter(Boolean).slice(0, 8).join(',');
        q.saveTeach.run(/^https:\/\/[^\s<>"']+$/.test(mu) ? mu : null, modes, str(b.intro ?? me.intro, 1000), b.tags === undefined ? (me.tags || '') : tags, now(), me.id);
      }
      return send(res, 200, pub(q.userById.get(me.id)));
    }
    if (m === 'DELETE') { rmAvatar(me.avatar); q.delUser.run(me.id); setCookie(res, '', 0); return send(res, 200, { ok: true }); }
    return send(res, 405, { error: 'method' });
  }

  if (p.startsWith('/api/') && !me && !p.startsWith('/api/admin/')) return send(res, 401, { error: 'login' });

  // 프로필 사진: 브라우저에서 줄인 jpg/png/webp 를 그대로 올림
  if (p === '/api/me/avatar') {
    if (m === 'DELETE') { rmAvatar(me.avatar); q.setAvatar.run(null, now(), me.id); return send(res, 200, pub(q.userById.get(me.id))); }
    if (m !== 'POST') return send(res, 405, { error: 'method' });
    if (limited('av:' + me.id, 20, 3600)) return send(res, 429, { error: 'rate' });
    const ct = String(req.headers['content-type'] || '').split(';')[0].trim().toLowerCase();
    const buf = await readRaw(req, 600 * 1024);
    const kind = IMG.find(x => x[1] === ct && x[2](buf));
    if (!kind || buf.length < 100) return send(res, 415, { error: 'image' });
    const name = `${me.id}-${crypto.randomBytes(9).toString('base64url')}.${kind[0]}`;
    fs.writeFileSync(path.join(AV_DIR, name), buf);
    rmAvatar(me.avatar); q.setAvatar.run(name, now(), me.id);
    return send(res, 200, pub(q.userById.get(me.id)));
  }

  // 실력 테스트 결과
  if (p === '/api/me/test' && m === 'POST') {
    const b = await readJson(req);
    const step = Math.trunc(+b.step), total = Math.trunc(+b.total), score = Math.trunc(+b.score);
    if (!(step >= 0 && step <= 6 && total >= 1 && total <= 80 && score >= 0 && score <= total)) return send(res, 400, { error: 'invalid' });
    if (q.testsToday.get(me.id, now() - DAY).n >= 20) return send(res, 429, { error: 'rate' });
    q.insTest.run(me.id, step, score, total, now());
    return send(res, 200, pub(q.userById.get(me.id)));
  }

  if (p === '/api/events' && m === 'GET') return sse(req, res, me);

  // 학습 진도(기기 간 동기화): 클라이언트가 병합한 JSON 을 통째로 저장
  if (p === '/api/progress') {
    if (m === 'GET') { const r = q.getProg.get(me.id); return send(res, 200, { data: r ? js(r.data, {}) : {}, updatedAt: r ? r.updated_at : 0 }); }
    if (m !== 'PUT') return send(res, 405, { error: 'method' });
    if (limited('pg:' + me.id, 120, 600)) return send(res, 429, { error: 'rate' });
    const raw = await readBody(req, 400 * 1024);
    let b; try { b = JSON.parse(raw); } catch { return send(res, 400, { error: 'json' }); }
    if (!b || typeof b.data !== 'object' || Array.isArray(b.data)) return send(res, 400, { error: 'data' });
    q.putProg.run(me.id, JSON.stringify(b.data), now());
    return send(res, 200, { ok: true, updatedAt: now() });
  }
  // 선생님: 매칭된 학생의 진도 요약
  const sp = /^\/api\/students\/(\d+)\/progress$/.exec(p);
  if (sp && m === 'GET') {
    const st = q.userById.get(+sp[1]);
    if (!st || !q.anyMatch.get(st.id, me.id)) return send(res, 403, { error: 'not your student' });
    const r = q.getProg.get(st.id);
    return send(res, 200, { student: peer(st), data: r ? js(r.data, {}) : {}, updatedAt: r ? r.updated_at : 0 });
  }
  // 선생님: 자주 쓰는 대면 수업 장소
  if (p === '/api/me/places' && m === 'PUT') {
    if (!isTeacherUser(me)) return send(res, 403, { error: 'teachers only' });
    const b = await readJson(req), list = (Array.isArray(b.places) ? b.places : []).map(cleanPlace).filter(Boolean).slice(0, 12);
    q.savePlaces.run(JSON.stringify(list), now(), me.id);
    return send(res, 200, pub(q.userById.get(me.id)));
  }
  const tp = /^\/api\/teachers\/(\d+)$/.exec(p);
  if (tp && m === 'GET') {
    const x = q.userById.get(+tp[1]);
    if (!x || !isTeacherUser(x)) return send(res, 404, { error: 'not found' });
    const am = q.activeMatch.get(me.id, x.id), t = now();
    return send(res, 200, { ...peer(x), freeSlots: q.freeCount.get(x.id, t).n, upcoming: q.freeSlots.all(x.id, t).slice(0, 30).map(s => ({ start: s.start, dur: s.dur, mode: s.mode || 'online', place: js(s.place, null) })), match: am ? { id: am.id, status: am.status } : null });
  }

  if (p === '/api/summary' && m === 'GET') {
    const ms = q.myMatches.all(me.id, me.id);
    return send(res, 200, { unread: q.unreadAll.get(me.id).n, requests: ms.filter(x => x.teacher_id === me.id && x.status === 'pending').length, next: (q.schedule.all(me.id, now())[0] || null) && slotOut(q.schedule.all(me.id, now())[0], me) });
  }

  // 선생님 찾기
  if (p === '/api/teachers' && m === 'GET') {
    const t = now();
    return send(res, 200, { teachers: q.teachers.all(me.id).map(x => { const am = q.activeMatch.get(me.id, x.id); return { ...peer(x), freeSlots: q.freeCount.get(x.id, t).n, match: am ? { id: am.id, status: am.status } : null }; }) });
  }

  if (p === '/api/matches') {
    if (m === 'GET') return send(res, 200, { matches: q.myMatches.all(me.id, me.id).map(x => matchOut(x, me)) });
    if (m !== 'POST') return send(res, 405, { error: 'method' });
    if (!isStudentUser(me)) return send(res, 403, { error: 'students only' });
    const b = await readJson(req);
    const teacher = q.userById.get(Math.trunc(+b.teacherId));
    if (!teacher || !isTeacherUser(teacher) || teacher.id === me.id) return send(res, 404, { error: 'teacher' });
    const ex = q.activeMatch.get(me.id, teacher.id);
    if (ex) return send(res, 409, { error: 'exists', match: matchOut(ex, me) });
    if (q.reqToday.get(me.id, now() - DAY).n >= 10) return send(res, 429, { error: 'rate' });
    const t = now(), r = q.insMatch.run(me.id, teacher.id, t, t, t), mt = q.match.get(Number(r.lastInsertRowid));
    const msg = str(b.message, 1000);
    sysMsg(mt, me.id, { t: 'request' });
    if (msg) { q.insMsg.run(mt.id, me.id, 'text', msg, t); }
    emit(teacher.id, { t: 'match', matchId: mt.id });
    return send(res, 201, matchOut(q.match.get(mt.id), me));
  }

  const mm0 = /^\/api\/matches\/(\d+)(\/messages)?$/.exec(p);
  if (mm0) {
    const mt = q.match.get(+mm0[1]), side = mt && sideOf(mt, me);
    if (!side) return send(res, 404, { error: 'not found' });
    if (mm0[2]) {
      if (m === 'GET') {
        const after = Math.max(0, Math.trunc(+u.searchParams.get('after') || 0));
        const list = after ? q.msgsAfter.all(mt.id, after) : q.msgsLast.all(mt.id);
        if (q.markRead.run(now(), mt.id, me.id).changes) emit(otherId(mt, me), { t: 'read', matchId: mt.id });
        return send(res, 200, { match: matchOut(mt, me), messages: list.map(msgOut) });
      }
      if (m !== 'POST') return send(res, 405, { error: 'method' });
      if (!['pending', 'accepted'].includes(mt.status)) return send(res, 409, { error: 'closed' });
      if (limited('msg:' + me.id, 40, 60)) return send(res, 429, { error: 'rate' });
      const b = await readJson(req), body = String(b.body ?? '').replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g, '').trim().slice(0, 1000);
      if (!body) return send(res, 400, { error: 'empty' });
      const t = now(), r = q.insMsg.run(mt.id, me.id, 'text', body, t);
      q.touchMatch.run(t, mt.id);
      emit(otherId(mt, me), { t: 'msg', matchId: mt.id, id: Number(r.lastInsertRowid) });
      return send(res, 201, msgOut(q.msgsAfter.get(mt.id, Number(r.lastInsertRowid) - 1)));
    }
    if (m === 'GET') return send(res, 200, matchOut(mt, me));
    if (m !== 'POST') return send(res, 405, { error: 'method' });
    const b = await readJson(req);
    const rules = { accept: ['teacher', 'pending', 'accepted'], decline: ['teacher', 'pending', 'declined'], cancel: ['student', 'pending', 'canceled'], end: [null, 'accepted', 'ended'] };
    const rule = rules[b.action];
    if (!rule) return send(res, 400, { error: 'action' });
    if ((rule[0] && rule[0] !== side) || mt.status !== rule[1]) return send(res, 409, { error: 'state' });
    const t = now();
    q.setMatch.run(rule[2], t, t, mt.id);
    if (rule[2] === 'ended') for (const s of q.matchFuture.all(mt.id, t)) q.unbook.run(s.id);
    sysMsg(mt, me.id, { t: rule[2] });
    emit(otherId(mt, me), { t: 'match', matchId: mt.id });
    return send(res, 200, matchOut(q.match.get(mt.id), me));
  }

  // 일정: 선생님이 가능한 시간을 열고, 매칭된 학생이 예약
  if (p === '/api/slots') {
    if (m === 'GET') {
      const tid = Math.trunc(+u.searchParams.get('teacher') || 0) || me.id, t = now();
      if (tid === me.id) { if (!isTeacherUser(me)) return send(res, 403, { error: 'teachers only' }); return send(res, 200, { slots: q.teacherSlots.all(me.id, t).map(s => slotOut(s, me)) }); }
      const am = q.activeMatch.get(me.id, tid);
      if (!am || am.status !== 'accepted') return send(res, 403, { error: 'not matched' });
      return send(res, 200, { slots: q.freeSlots.all(tid, t).map(s => slotOut(s, me)) });
    }
    if (m !== 'POST') return send(res, 405, { error: 'method' });
    if (!isTeacherUser(me)) return send(res, 403, { error: 'teachers only' });
    const b = await readJson(req), list = Array.isArray(b.slots) ? b.slots.slice(0, 40) : [], t = now();
    const mode = b.mode === 'offline' ? 'offline' : 'online';
    const place = mode === 'offline' ? cleanPlace(b.place) : null;
    if (mode === 'offline' && !place) return send(res, 400, { error: 'place' });
    const mu = str(b.url, 300), url = mode === 'online' ? (/^https:\/\/[^\s<>"']+$/.test(mu) ? mu : me.meet_url || '') : '';
    let made = 0, skipped = 0;
    for (const x of list) {
      const start = Math.trunc(+x.start), dur = Math.trunc(+x.dur);
      if (!(start > t && start < t + 120 * DAY && dur >= 20 && dur <= 180 && start % 60 === 0)) { skipped++; continue; }
      if (q.overlap.get(me.id, start + dur * 60, start).n || q.futureCount.get(me.id, t).n >= 300) { skipped++; continue; }
      q.insSlot.run(me.id, start, dur, t, mode, place ? JSON.stringify(place) : null, url || (mode === 'online' ? `https://meet.jit.si/guruguru-${crypto.randomBytes(8).toString('hex')}` : null)); made++;
    }
    return send(res, made ? 201 : 400, { made, skipped, slots: q.teacherSlots.all(me.id, t).map(s => slotOut(s, me)) });
  }
  const sm = /^\/api\/slots\/(\d+)(?:\/(book|cancel))?$/.exec(p);
  if (sm) {
    const s = q.slot.get(+sm[1]);
    if (!s) return send(res, 404, { error: 'not found' });
    const t = now(), mine = s.teacher_id === me.id, booker = s.student_id === me.id;
    if (sm[2] === 'book' && m === 'POST') {
      const am = q.activeMatch.get(me.id, s.teacher_id);
      if (!am || am.status !== 'accepted') return send(res, 403, { error: 'not matched' });
      if (s.start <= t) return send(res, 409, { error: 'past' });
      if (!q.book.run(me.id, am.id, t, s.id).changes) return send(res, 409, { error: 'taken' });
      sysMsg(am, me.id, { t: 'book', start: s.start, dur: s.dur });
      emit(s.teacher_id, { t: 'slot', slotId: s.id });
      return send(res, 200, slotOut(q.slot.get(s.id), me));
    }
    if (sm[2] === 'cancel' && m === 'POST') {
      if (!(mine || booker) || !s.student_id) return send(res, 409, { error: 'state' });
      if (s.start <= t) return send(res, 409, { error: 'past' });
      const mt = s.match_id && q.match.get(s.match_id);
      q.unbook.run(s.id);
      if (mt) sysMsg(mt, me.id, { t: 'unbook', start: s.start, dur: s.dur });
      emit(mine ? s.student_id : s.teacher_id, { t: 'slot', slotId: s.id });
      return send(res, 200, slotOut(q.slot.get(s.id), me));
    }
    if (!mine || sm[2]) return send(res, 403, { error: 'owner only' });
    if (m === 'PUT') {
      const b = await readJson(req), no = Math.trunc(+b.lessonNo) || null;
      q.slotInfo.run(no && no >= 1 && no <= 290 ? no : null, str(b.note, 200), s.id);
      if (s.student_id) emit(s.student_id, { t: 'slot', slotId: s.id });
      return send(res, 200, slotOut(q.slot.get(s.id), me));
    }
    if (m === 'DELETE') {
      if (s.student_id && s.start > t) {
        const mt = s.match_id && q.match.get(s.match_id);
        if (mt) sysMsg(mt, me.id, { t: 'unbook', start: s.start, dur: s.dur });
        emit(s.student_id, { t: 'slot', slotId: s.id });
      }
      q.delSlot.run(s.id);
      return send(res, 200, { ok: true });
    }
    return send(res, 405, { error: 'method' });
  }

  if (p === '/api/schedule' && m === 'GET') return send(res, 200, { lessons: q.schedule.all(me.id, now()).map(s => slotOut(s, me)) });

  if (p.startsWith('/api/admin/')) {
    if (!me) return send(res, 401, { error: 'login' });
    if (!isAdmin(me)) return send(res, 403, { error: 'admin only' });
    if (p === '/api/admin/users' && m === 'GET') return send(res, 200, { users: q.allUsers.all().map(adminRow) });
    const mm = /^\/api\/admin\/users\/(\d+)$/.exec(p);
    if (mm && m === 'POST') {
      const target = q.userById.get(+mm[1]);
      if (!target) return send(res, 404, { error: 'not found' });
      const b = await readJson(req);
      const map = { approve: ['teacher', 'approved'], reject: [target.role || 'student', 'rejected'], student: ['student', 'none'] };
      const v = map[b.action];
      if (!v) return send(res, 400, { error: 'action' });
      q.setStatus.run(v[0], v[1], now(), target.id);
      return send(res, 200, adminRow(q.userById.get(target.id)));
    }
    return send(res, 404, { error: 'not found' });
  }

  return send(res, 404, { error: 'not found' });
}

export const server = http.createServer((req, res) => {
  handle(req, res).catch(e => {
    if (!res.headersSent) send(res, e.code && e.code >= 400 && e.code < 500 ? e.code : 500, { error: e.code ? e.message : 'server error' });
    if (!e.code) console.error(e);
  });
});
if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname)) {
  if (!CFG.clientId) console.warn('[guruguru-api] GOOGLE_CLIENT_ID 가 비어 있습니다 — 로그인 비활성');
  server.listen(CFG.port, () => console.log(`[guruguru-api] :${CFG.port} db=${CFG.db} admins=${CFG.admins.length}`));
  const stop = () => { server.close(); db.close(); process.exit(0); };
  process.on('SIGTERM', stop); process.on('SIGINT', stop);
}
