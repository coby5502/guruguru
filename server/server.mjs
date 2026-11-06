// ぐるぐる API — Google 로그인 · 프로필 · 역할(학생/선생) · 관리자 승인
// 의존성 없음: Node 22.13+ (node:sqlite, node:crypto)
//
// 환경 변수
//   GOOGLE_CLIENT_ID  (필수) Google OAuth 웹 클라이언트 ID
//   ADMIN_EMAILS      관리자 이메일 (쉼표 구분) — 선생님 승인 권한
//   ORIGINS           허용 Origin (쉼표 구분, 예: https://guruguru.app)
//   SITE_DIR          사이트 폴더(읽기 전용 마운트) — 교사용 지도안 PDF 를 선생님에게만 내보냄
//   PORT=8787  DB_PATH=/data/guruguru.db  COOKIE_SECURE=1  TRUST_PROXY=1
import http from 'node:http';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';

const env = (k, d = '') => (process.env[k] ?? d).trim();
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
`);
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
const pub = u => ({
  id: u.id, email: u.email, name: u.name || u.google_name || '', picture: u.picture || '',
  role: u.role, teacherStatus: u.teacher_status, level: u.level || '', goal: u.goal || '', bio: u.bio || '', lang: u.lang || '',
  profileDone: !!(u.role && u.name), view: view(u), admin: isAdmin(u),
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
async function readBody(req, max = 16384) {
  let size = 0; const chunks = [];
  for await (const c of req) { size += c.length; if (size > max) throw Object.assign(new Error('too large'), { code: 413 }); chunks.push(c); }
  return Buffer.concat(chunks).toString();
}
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
      return send(res, 200, pub(q.userById.get(me.id)));
    }
    if (m === 'DELETE') { q.delUser.run(me.id); setCookie(res, '', 0); return send(res, 200, { ok: true }); }
    return send(res, 405, { error: 'method' });
  }

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
