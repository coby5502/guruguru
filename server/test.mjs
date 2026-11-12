// API 테스트: 가짜 JWKS 로 Google ID 토큰을 서명해 전체 흐름을 확인 (node server/test.mjs)
import http from 'node:http';
import crypto from 'node:crypto';
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';
import assert from 'node:assert/strict';

const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
const jwk = { ...publicKey.export({ format: 'jwk' }), kid: 'k1', alg: 'RS256', use: 'sig' };
const jw = http.createServer((q, r) => { r.writeHead(200, { 'content-type': 'application/json', 'cache-control': 'max-age=60' }); r.end(JSON.stringify({ keys: [jwk] })); });
await new Promise(r => jw.listen(0, r));

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gg-'));
Object.assign(process.env, {
  GOOGLE_CLIENT_ID: 'cid.apps.googleusercontent.com', ADMIN_EMAILS: 'boss@example.com', ORIGINS: 'https://guruguru.app',
  DB_PATH: path.join(dir, 't.db'), SITE_DIR: dir, COOKIE_SECURE: '0', GOOGLE_JWKS_URL: `http://127.0.0.1:${jw.address().port}/`,
});
fs.mkdirSync(path.join(dir, 'pdf')); fs.writeFileSync(path.join(dir, 'pdf', 'l1-guide.pdf'), '%PDF-test');
const { server, encryptPush } = await import('./server.mjs');
await new Promise(r => server.listen(0, r));
const base = `http://127.0.0.1:${server.address().port}`;

const b64 = o => Buffer.from(JSON.stringify(o)).toString('base64url');
const tok = (claims, key = privateKey, kid = 'k1') => {
  const h = b64({ alg: 'RS256', kid, typ: 'JWT' }), p = b64({ iss: 'https://accounts.google.com', aud: process.env.GOOGLE_CLIENT_ID, exp: Math.floor(Date.now() / 1000) + 600, email_verified: true, ...claims });
  return `${h}.${p}.${crypto.sign('RSA-SHA256', Buffer.from(h + '.' + p), key).toString('base64url')}`;
};
const call = async (m, p, { body, cookie, origin = 'https://guruguru.app' } = {}) => {
  const r = await fetch(base + p, { method: m, headers: { ...(body ? { 'content-type': 'application/json' } : {}), ...(cookie ? { cookie } : {}), ...(m !== 'GET' && origin ? { origin } : {}) }, body: body ? JSON.stringify(body) : undefined });
  const t = await r.text();
  return { s: r.status, j: t ? JSON.parse(t) : null, c: (r.headers.get('set-cookie') || '').split(';')[0] };
};
const login = async (sub, email, name) => { const r = await call('POST', '/api/auth/google', { body: { credential: tok({ sub, email, name }) } }); assert.equal(r.s, 200, JSON.stringify(r.j)); return { ...r, cookie: r.c }; };

let r = await call('GET', '/api/config'); assert.equal(r.j.googleClientId, process.env.GOOGLE_CLIENT_ID);
assert.equal((await call('GET', '/api/me')).s, 401);
// 잘못된 토큰들
const other = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 }).privateKey;
for (const bad of [tok({ sub: 'x', email: 'x@x' }, other), tok({ sub: 'x', email: 'x@x', aud: 'evil' }), tok({ sub: 'x', email: 'x@x', iss: 'evil' }), tok({ sub: 'x', email: 'x@x', exp: 1 }), tok({ sub: 'x', email: 'x@x', email_verified: false }), 'a.b.c', ''])
  assert.equal((await call('POST', '/api/auth/google', { body: { credential: bad } })).s, 401, bad.slice(0, 20));
// Origin 검사
assert.equal((await call('POST', '/api/auth/google', { body: { credential: tok({ sub: 's', email: 's@x' }) }, origin: 'https://evil.com' })).s, 403);

// 학생
const st = await login('s1', 'stu@example.com', 'Hana');
assert.equal(st.j.profileDone, false); assert.equal(st.j.view, 'student');
r = await call('PUT', '/api/me', { cookie: st.cookie, body: { name: 'はな', role: 'student', level: 'zero', goal: '旅行' } });
assert.equal(r.s, 200); assert.equal(r.j.profileDone, true); assert.equal(r.j.view, 'student'); assert.equal(r.j.level, 'zero');
assert.equal((await call('GET', '/api/auth/teacher', { cookie: st.cookie })).s, 403);
assert.equal((await call('GET', '/api/admin/users', { cookie: st.cookie })).s, 403);

// 선생 신청 → 대기 → 승인
const te = await login('t1', 'teacher@example.com', 'Kim');
r = await call('PUT', '/api/me', { cookie: te.cookie, body: { name: '김선생', role: 'teacher', bio: 'hi' } });
assert.equal(r.j.teacherStatus, 'pending'); assert.equal(r.j.view, 'student');
assert.equal((await call('GET', '/api/auth/teacher', { cookie: te.cookie })).s, 403);

const ad = await login('a1', 'Boss@example.com', 'Boss');
assert.equal(ad.j.admin, true); assert.equal(ad.j.view, 'teacher');
r = await call('GET', '/api/admin/users', { cookie: ad.cookie });
assert.equal(r.j.users[0].email, 'teacher@example.com'); assert.equal(r.j.users[0].teacherStatus, 'pending');
r = await call('POST', `/api/admin/users/${te.j.id}`, { cookie: ad.cookie, body: { action: 'approve' } });
assert.equal(r.j.view, 'teacher');
assert.equal((await call('GET', '/api/auth/teacher', { cookie: te.cookie })).s, 204);
// 선생 본인이 프로필 다시 저장해도 승인 유지
r = await call('PUT', '/api/me', { cookie: te.cookie, body: { name: '김선생님', role: 'teacher' } });
assert.equal(r.j.teacherStatus, 'approved');
// 지도안 PDF
assert.equal((await fetch(base + '/pdf/l1-guide.pdf')).status, 401);
assert.equal((await fetch(base + '/pdf/l1-guide.pdf', { headers: { cookie: st.cookie } })).status, 403);
{ const pr = await fetch(base + '/pdf/l1-guide.pdf', { headers: { cookie: te.cookie } }); assert.equal(pr.status, 200); assert.equal(await pr.text(), '%PDF-test'); }
assert.equal((await fetch(base + '/pdf/l2-guide.pdf', { headers: { cookie: te.cookie } })).status, 404);
assert.equal((await fetch(base + '/pdf/..%2F..%2Fetc%2Fpasswd-guide.pdf', { headers: { cookie: te.cookie } })).status, 404);
// 반려
r = await call('POST', `/api/admin/users/${te.j.id}`, { cookie: ad.cookie, body: { action: 'reject' } });
assert.equal(r.j.view, 'student');
// 재로그인 시 같은 유저
const st2 = await login('s1', 'stu@example.com', 'Hana');
assert.equal(st2.j.id, st.j.id); assert.equal(st2.j.name, 'はな');
// 로그아웃
assert.equal((await call('POST', '/api/auth/logout', { cookie: st.cookie })).s, 200);
assert.equal((await call('GET', '/api/me', { cookie: st.cookie })).s, 401);
assert.equal((await call('GET', '/api/me', { cookie: st2.cookie })).s, 200);
// 입력 검증
assert.equal((await call('PUT', '/api/me', { cookie: st2.cookie, body: { name: '', role: 'student' } })).s, 400);
assert.equal((await fetch(base + '/api/me', { method: 'PUT', headers: { cookie: st2.cookie, origin: 'https://guruguru.app', 'content-type': 'text/plain' }, body: '{}' })).status, 415);
// 탈퇴
assert.equal((await call('DELETE', '/api/me', { cookie: st2.cookie })).s, 200);
assert.equal((await call('GET', '/api/me', { cookie: st2.cookie })).s, 401);

// 리디렉트 로그인
{
  const form = (o, ck) => fetch(base + '/api/auth/google/redirect', { method: 'POST', redirect: 'manual', headers: { 'content-type': 'application/x-www-form-urlencoded', origin: 'https://accounts.google.com', ...(ck ? { cookie: 'g_csrf_token=' + ck } : {}) }, body: new URLSearchParams(o) });
  let rr = await form({ credential: tok({ sub: 'r1', email: 'r@x.com' }), g_csrf_token: 'abc' }, 'abc');
  assert.equal(rr.status, 303); assert.equal(rr.headers.get('location'), '/#/'); assert.match(rr.headers.get('set-cookie') || '', /gg_sid=/);
  rr = await form({ credential: tok({ sub: 'r1', email: 'r@x.com' }), g_csrf_token: 'abc' }, 'zzz');
  assert.equal(rr.headers.get('location'), '/#/login-error');
  rr = await form({ credential: tok({ sub: 'r1', email: 'r@x.com' }, other), g_csrf_token: 'abc' }, 'abc');
  assert.equal(rr.headers.get('location'), '/#/login-error');
}

// ===== 프로필 사진 · 실력 테스트 · 매칭 · 일정 · 채팅 =====
{
  const raw = async (m, p, cookie, ct, body) => { const r = await fetch(base + p, { method: m, headers: { cookie, origin: 'https://guruguru.app', 'content-type': ct }, body }); const t = await r.text(); return { s: r.status, j: t && /json/.test(r.headers.get('content-type') || '') ? JSON.parse(t) : null }; };
  const s1 = await login('ss1', 'ss1@example.com', 'Yui');
  await call('PUT', '/api/me', { cookie: s1.cookie, body: { name: 'ゆい', role: 'student', level: 'beginner' } });
  const t1 = await login('tt1', 'tt1@example.com', 'Lee');
  await call('PUT', '/api/me', { cookie: t1.cookie, body: { name: '이선생', role: 'teacher', bio: '회화 전문' } });
  await call('POST', `/api/admin/users/${t1.j.id}`, { cookie: ad.cookie, body: { action: 'approve' } });
  const s2 = await login('ss2', 'ss2@example.com', 'Ken');
  await call('PUT', '/api/me', { cookie: s2.cookie, body: { name: 'けん', role: 'student' } });

  // 사진
  const jpg = Buffer.concat([Buffer.from([0xff, 0xd8, 0xff, 0xe0]), Buffer.alloc(300, 1)]);
  let x = await raw('POST', '/api/me/avatar', s1.cookie, 'image/jpeg', jpg);
  assert.equal(x.s, 200); assert.match(x.j.picture, /^\/api\/avatar\/\d+-[\w-]+\.jpg$/);
  const pic = x.j.picture;
  { const g = await fetch(base + pic); assert.equal(g.status, 200); assert.equal(g.headers.get('content-type'), 'image/jpeg'); assert.equal((await g.arrayBuffer()).byteLength, jpg.length); }
  assert.equal((await raw('POST', '/api/me/avatar', s1.cookie, 'image/png', jpg)).s, 415);
  assert.equal((await raw('POST', '/api/me/avatar', s1.cookie, 'image/jpeg', Buffer.from('<svg onload=alert(1)>'.repeat(10)))).s, 415);
  assert.equal((await raw('POST', '/api/me/avatar', s1.cookie, 'image/jpeg', Buffer.alloc(700 * 1024, 0xff))).s, 413);
  assert.equal((await raw('POST', '/api/me/avatar', '', 'image/jpeg', jpg)).s, 401);
  x = await raw('POST', '/api/me/avatar', s1.cookie, 'image/jpeg', jpg);
  assert.equal((await fetch(base + pic)).status, 404, 'old avatar removed');
  assert.notEqual((await fetch(base + '/api/avatar/..%2Ft.db')).status, 200);

  // 실력 테스트
  r = await call('POST', '/api/me/test', { cookie: s1.cookie, body: { step: 2, score: 10, total: 14 } });
  assert.equal(r.s, 200); assert.equal(r.j.test.step, 2);
  assert.equal((await call('POST', '/api/me/test', { cookie: s1.cookie, body: { step: 9, score: 1, total: 1 } })).s, 400);
  assert.equal((await call('POST', '/api/me/test', { cookie: s1.cookie, body: { step: 1, score: 5, total: 3 } })).s, 400);

  // 이벤트 스트림
  const es = await fetch(base + '/api/events', { headers: { cookie: t1.cookie } });
  assert.equal(es.headers.get('content-type'), 'text/event-stream; charset=utf-8');
  const rd = es.body.getReader(); let evText = '';
  const pump = (async () => { for (;;) { const { value, done } = await rd.read(); if (done) break; evText += Buffer.from(value).toString(); } })();

  // 선생님 목록 · 신청
  r = await call('GET', '/api/teachers', { cookie: s1.cookie });
  const lee = r.j.teachers.find(t => t.id === t1.j.id);
  assert.ok(lee); assert.equal(lee.name, '이선생'); assert.equal(lee.email, undefined);
  assert.ok(!r.j.teachers.some(t => t.id === te.j.id), 'rejected teacher hidden');
  assert.equal((await call('POST', '/api/matches', { cookie: t1.cookie, body: { teacherId: t1.j.id } })).s, 403);
  assert.equal((await call('POST', '/api/matches', { cookie: s1.cookie, body: { teacherId: te.j.id } })).s, 404);
  r = await call('POST', '/api/matches', { cookie: s1.cookie, body: { teacherId: t1.j.id, message: 'よろしくお願いします' } });
  assert.equal(r.s, 201); assert.equal(r.j.status, 'pending');
  const mid = r.j.id;
  assert.equal((await call('POST', '/api/matches', { cookie: s1.cookie, body: { teacherId: t1.j.id } })).s, 409);
  r = await call('GET', '/api/summary', { cookie: t1.cookie }); assert.equal(r.j.requests, 1); assert.equal(r.j.unread, 2);
  r = await call('GET', '/api/matches', { cookie: t1.cookie });
  assert.equal(r.j.matches[0].peer.name, 'ゆい'); assert.equal(r.j.matches[0].peer.test.step, 2); assert.equal(r.j.matches[0].peer.email, undefined); assert.equal(r.j.matches[0].side, 'teacher');
  // 남의 대화 접근 불가
  assert.equal((await call('GET', `/api/matches/${mid}/messages`, { cookie: s2.cookie })).s, 404);
  assert.equal((await call('POST', `/api/matches/${mid}`, { cookie: s1.cookie, body: { action: 'accept' } })).s, 409);
  r = await call('POST', `/api/matches/${mid}`, { cookie: t1.cookie, body: { action: 'accept' } });
  assert.equal(r.j.status, 'accepted');

  // 채팅
  r = await call('POST', `/api/matches/${mid}/messages`, { cookie: t1.cookie, body: { body: '안녕하세요! 반가워요 <b>' } });
  assert.equal(r.s, 201); assert.equal(r.j.body, '안녕하세요! 반가워요 <b>');
  assert.equal((await call('POST', `/api/matches/${mid}/messages`, { cookie: s1.cookie, body: { body: '   ' } })).s, 400);
  r = await call('GET', '/api/summary', { cookie: s1.cookie }); assert.ok(r.j.unread >= 2);
  r = await call('GET', `/api/matches/${mid}/messages`, { cookie: s1.cookie });
  assert.ok(r.j.messages.some(m => m.kind === 'sys' && m.body.t === 'accepted'));
  const lastId = r.j.messages.at(-1).id;
  r = await call('GET', '/api/summary', { cookie: s1.cookie }); assert.equal(r.j.unread, 0);
  await call('POST', `/api/matches/${mid}/messages`, { cookie: s1.cookie, body: { body: 'はい！' } });
  r = await call('GET', `/api/matches/${mid}/messages?after=${lastId}`, { cookie: t1.cookie });
  assert.equal(r.j.messages.length, 1); assert.equal(r.j.messages[0].body, 'はい！');

  // 일정
  const H = 3600, base0 = Math.floor(Date.now() / 1000 / 3600) * 3600 + 48 * H;
  assert.equal((await call('POST', '/api/slots', { cookie: s1.cookie, body: { slots: [{ start: base0, dur: 60 }] } })).s, 403);
  r = await call('POST', '/api/slots', { cookie: t1.cookie, body: { slots: [{ start: base0, dur: 60 }, { start: base0 + 30 * 60, dur: 60 }, { start: base0 + 2 * H, dur: 50 }, { start: 100, dur: 60 }] } });
  assert.equal(r.j.made, 2); assert.equal(r.j.skipped, 2);
  const [sa, sb] = r.j.slots;
  assert.equal((await call('GET', `/api/slots?teacher=${t1.j.id}`, { cookie: s2.cookie })).s, 403);
  r = await call('GET', `/api/slots?teacher=${t1.j.id}`, { cookie: s1.cookie }); assert.equal(r.j.slots.length, 2);
  assert.equal((await call('POST', `/api/slots/${sa.id}/book`, { cookie: s2.cookie })).s, 403);
  r = await call('POST', `/api/slots/${sa.id}/book`, { cookie: s1.cookie }); assert.equal(r.s, 200); assert.equal(r.j.booked, true);
  assert.equal((await call('POST', `/api/slots/${sa.id}/book`, { cookie: s1.cookie })).s, 409);
  r = await call('GET', `/api/slots?teacher=${t1.j.id}`, { cookie: s1.cookie }); assert.equal(r.j.slots.length, 1);
  r = await call('PUT', `/api/slots/${sa.id}`, { cookie: t1.cookie, body: { lessonNo: 12, note: '교재 준비' } }); assert.equal(r.j.lessonNo, 12);
  assert.equal((await call('PUT', `/api/slots/${sa.id}`, { cookie: s1.cookie, body: { lessonNo: 1 } })).s, 403);
  r = await call('GET', '/api/schedule', { cookie: s1.cookie }); assert.equal(r.j.lessons.length, 1); assert.equal(r.j.lessons[0].with.name, '이선생'); assert.equal(r.j.lessons[0].lessonNo, 12);
  r = await call('GET', '/api/schedule', { cookie: t1.cookie }); assert.equal(r.j.lessons[0].with.name, 'ゆい');
  r = await call('GET', '/api/matches', { cookie: s1.cookie }); assert.equal(r.j.matches[0].next.start, base0);
  r = await call('POST', `/api/slots/${sa.id}/cancel`, { cookie: s1.cookie }); assert.equal(r.j.booked, false);
  await call('POST', `/api/slots/${sb.id}/book`, { cookie: s1.cookie });
  r = await call('GET', `/api/matches/${mid}/messages`, { cookie: t1.cookie });
  assert.deepEqual(r.j.messages.filter(m => m.kind === 'sys').map(m => m.body.t), ['request', 'accepted', 'book', 'unbook', 'book']);
  // 매칭 종료 → 예약 해제, 채팅 닫힘
  r = await call('POST', `/api/matches/${mid}`, { cookie: s1.cookie, body: { action: 'end' } }); assert.equal(r.j.status, 'ended');
  r = await call('GET', '/api/schedule', { cookie: s1.cookie }); assert.equal(r.j.lessons.length, 0);
  assert.equal((await call('POST', `/api/matches/${mid}/messages`, { cookie: s1.cookie, body: { body: 'x' } })).s, 409);
  assert.equal((await call('POST', `/api/slots/${sa.id}/book`, { cookie: s1.cookie })).s, 403);
  // 다시 신청 가능
  assert.equal((await call('POST', '/api/matches', { cookie: s1.cookie, body: { teacherId: t1.j.id } })).s, 201);
  assert.equal((await call('DELETE', `/api/slots/${sb.id}`, { cookie: t1.cookie })).s, 200);

  await new Promise(r => setTimeout(r, 100));
  assert.match(evText, /"t":"match"/); assert.match(evText, /"t":"msg"/); assert.match(evText, /"t":"slot"/);
  rd.cancel().catch(() => {}); await pump.catch(() => {});

  // 탈퇴 시 사진 삭제
  const pic2 = (await call('GET', '/api/me', { cookie: s1.cookie })).j.picture;
  await call('DELETE', '/api/me', { cookie: s1.cookie });
  assert.equal((await fetch(base + pic2)).status, 404);
}

// ===== 진도 · 대면/온라인 · 장소 · 선생님 프로필 =====
{
  const s3 = await login('ss3', 'ss3@example.com', 'Mio');
  await call('PUT', '/api/me', { cookie: s3.cookie, body: { name: 'みお', role: 'student' } });
  let x = await call('PUT', '/api/progress', { cookie: s3.cookie, body: { data: { done: [1, 2], srs: { 'w:가': { b: 1, d: 1, n: 0, t: 1 } } } } });
  assert.equal(x.s, 200);
  x = await call('GET', '/api/progress', { cookie: s3.cookie }); assert.deepEqual(x.j.data.done, [1, 2]);
  assert.equal((await call('PUT', '/api/progress', { cookie: s3.cookie, body: { data: [1] } })).s, 400);
  const t2 = await login('tt2', 'tt2@example.com', 'Park');
  x = await call('PUT', '/api/me', { cookie: t2.cookie, body: { name: '박선생', role: 'teacher', modes: 'both', meetUrl: 'javascript:alert(1)', intro: '안녕하세요', tags: '회화, 발음' } });
  assert.equal(x.j.meetUrl, ''); assert.equal(x.j.modes, 'both'); assert.deepEqual(x.j.tags, ['회화', '발음']);
  assert.equal((await call('PUT', '/api/me/places', { cookie: t2.cookie, body: { places: [] } })).s, 403, 'pending teacher');
  await call('POST', `/api/admin/users/${t2.j.id}`, { cookie: ad.cookie, body: { action: 'approve' } });
  x = await call('PUT', '/api/me', { cookie: t2.cookie, body: { name: '박선생', role: 'teacher', modes: 'both', meetUrl: 'https://zoom.us/j/123' } });
  assert.equal(x.j.meetUrl, 'https://zoom.us/j/123');
  x = await call('PUT', '/api/me/places', { cookie: t2.cookie, body: { places: [{ name: '博多駅', addr: '福岡市', lat: 33.5902, lng: 130.4207 }, { name: 'bad', lat: 999, lng: 0 }, { name: '', lat: 1, lng: 1 }] } });
  assert.equal(x.j.places.length, 1);
  const H = 3600, b0 = Math.floor(Date.now() / 1000 / H) * H + 30 * H;
  assert.equal((await call('POST', '/api/slots', { cookie: t2.cookie, body: { mode: 'offline', slots: [{ start: b0, dur: 60 }] } })).s, 400);
  x = await call('POST', '/api/slots', { cookie: t2.cookie, body: { mode: 'offline', place: x.j.places[0], slots: [{ start: b0, dur: 60 }] } });
  assert.equal(x.j.slots[0].mode, 'offline'); assert.equal(x.j.slots[0].place.name, '博多駅');
  x = await call('POST', '/api/slots', { cookie: t2.cookie, body: { mode: 'online', slots: [{ start: b0 + 2 * H, dur: 60 }] } });
  const on = x.j.slots.find(s => s.mode === 'online'); assert.equal(on.url, 'https://zoom.us/j/123');
  x = await call('GET', `/api/teachers/${t2.j.id}`, { cookie: s3.cookie });
  assert.equal(x.j.places[0].name, '博多駅'); assert.equal(x.j.upcoming.length, 2); assert.equal(x.j.upcoming[0].url, undefined); assert.equal(x.j.email, undefined);
  // 학생 진도: 매칭 전 403, 수락 후 200
  assert.equal((await call('GET', `/api/students/${s3.j.id}/progress`, { cookie: t2.cookie })).s, 403);
  const mm = await call('POST', '/api/matches', { cookie: s3.cookie, body: { teacherId: t2.j.id } });
  await call('POST', `/api/matches/${mm.j.id}`, { cookie: t2.cookie, body: { action: 'accept' } });
  x = await call('GET', `/api/students/${s3.j.id}/progress`, { cookie: t2.cookie }); assert.equal(x.s, 200); assert.deepEqual(x.j.data.done, [1, 2]);
  // 예약한 학생만 온라인 링크를 봄
  x = await call('GET', `/api/slots?teacher=${t2.j.id}`, { cookie: s3.cookie }); assert.equal(x.j.slots.find(s => s.mode === 'online').url, '');
  await call('POST', `/api/slots/${on.id}/book`, { cookie: s3.cookie });
  x = await call('GET', '/api/schedule', { cookie: s3.cookie }); assert.equal(x.j.lessons[0].url, 'https://zoom.us/j/123');
}

// ===== 웹 푸시 암호화(RFC 8291) 왕복 · 수업 기록 · 숙제 =====
{
  const ua = crypto.createECDH('prime256v1'); ua.generateKeys();
  const authS = crypto.randomBytes(16);
  const enc = encryptPush('{"title":"안녕"}', ua.getPublicKey().toString('base64url'), authS.toString('base64url'));
  const salt = enc.subarray(0, 16), rs = enc.readUInt32BE(16), idl = enc[20], as = enc.subarray(21, 21 + idl), ct = enc.subarray(21 + idl);
  assert.equal(rs, 4096); assert.equal(idl, 65);
  const shared = ua.computeSecret(as);
  const ikm = Buffer.from(crypto.hkdfSync('sha256', shared, authS, Buffer.concat([Buffer.from('WebPush: info\0'), ua.getPublicKey(), as]), 32));
  const cek = Buffer.from(crypto.hkdfSync('sha256', ikm, salt, Buffer.from('Content-Encoding: aes128gcm\0'), 16));
  const nonce = Buffer.from(crypto.hkdfSync('sha256', ikm, salt, Buffer.from('Content-Encoding: nonce\0'), 12));
  const d = crypto.createDecipheriv('aes-128-gcm', cek, nonce); d.setAuthTag(ct.subarray(ct.length - 16));
  const pt = Buffer.concat([d.update(ct.subarray(0, ct.length - 16)), d.final()]);
  assert.equal(pt.subarray(0, pt.length - 1).toString(), '{"title":"안녕"}'); assert.equal(pt[pt.length - 1], 2);

  const s4 = await login('ss4', 'ss4@example.com', 'Rin'); await call('PUT', '/api/me', { cookie: s4.cookie, body: { name: 'りん', role: 'student' } });
  let x = await call('GET', '/api/push', { cookie: s4.cookie }); assert.equal(Buffer.from(x.j.key, 'base64url').length, 65);
  assert.equal((await call('POST', '/api/push', { cookie: s4.cookie, body: { endpoint: 'http://evil', keys: {} } })).s, 400);
  assert.equal((await call('POST', '/api/push', { cookie: s4.cookie, body: { endpoint: 'https://push.invalid/abc', keys: { p256dh: ua.getPublicKey().toString('base64url'), auth: authS.toString('base64url') } } })).s, 200);
  x = await call('GET', '/api/push', { cookie: s4.cookie }); assert.equal(x.j.subscribed, 1);
  await call('DELETE', '/api/push', { cookie: s4.cookie, body: { endpoint: 'https://push.invalid/abc' } });

  // 지난 레슨 하나 만들기(DB 직접): 매칭 → 슬롯 예약 후 시작 시각을 과거로
  const t3 = await login('tt3', 'tt3@example.com', 'Choi'); await call('PUT', '/api/me', { cookie: t3.cookie, body: { name: '최선생', role: 'teacher' } });
  await call('POST', `/api/admin/users/${t3.j.id}`, { cookie: ad.cookie, body: { action: 'approve' } });
  const mt = await call('POST', '/api/matches', { cookie: s4.cookie, body: { teacherId: t3.j.id } });
  await call('POST', `/api/matches/${mt.j.id}`, { cookie: t3.cookie, body: { action: 'accept' } });
  const st0 = Math.floor(Date.now() / 1000 / 3600) * 3600 + 5 * 3600;
  x = await call('POST', '/api/slots', { cookie: t3.cookie, body: { slots: [{ start: st0, dur: 60 }] } });
  const sid = x.j.slots[0].id; await call('POST', `/api/slots/${sid}/book`, { cookie: s4.cookie });
  const { DatabaseSync } = await import('node:sqlite'); const db2 = new DatabaseSync(process.env.DB_PATH); db2.prepare('UPDATE slots SET start=? WHERE id=?').run(st0 - 3 * 86400, sid); db2.close();
  x = await call('GET', '/api/todo', { cookie: t3.cookie }); assert.equal(x.j.teacher.length, 1);
  assert.equal((await call('PUT', `/api/slots/${sid}/note`, { cookie: s4.cookie, body: { summary: 'x' } })).s, 403);
  assert.equal((await call('PUT', `/api/slots/${sid}/note`, { cookie: t3.cookie, body: { summary: '자기소개 연습', good: '발음이 좋아요', homework: '문장 5개 쓰기' } })).s, 200);
  x = await call('GET', '/api/todo', { cookie: s4.cookie }); assert.equal(x.j.student.length, 1);
  assert.equal((await call('POST', `/api/slots/${sid}/homework`, { cookie: s4.cookie, body: { text: '저는 린입니다.' } })).s, 200);
  const jpg = Buffer.concat([Buffer.from([0xff, 0xd8, 0xff, 0xe0]), Buffer.alloc(500, 3)]);
  const up = await fetch(base + `/api/slots/${sid}/hwimage`, { method: 'POST', headers: { cookie: s4.cookie, origin: 'https://guruguru.app', 'content-type': 'image/jpeg' }, body: jpg });
  const img = (await up.json()).image; assert.match(img, /^\/api\/media\//);
  assert.equal((await fetch(base + img, { headers: { cookie: t3.cookie } })).status, 200);
  assert.equal((await fetch(base + img, { headers: { cookie: te.cookie } })).status, 404);
  x = await call('GET', '/api/todo', { cookie: s4.cookie }); assert.equal(x.j.student.length, 0);
  x = await call('GET', '/api/todo', { cookie: t3.cookie }); assert.equal(x.j.teacher.length, 1, 'feedback pending');
  assert.equal((await call('PUT', `/api/slots/${sid}/feedback`, { cookie: t3.cookie, body: { text: '잘했어요!' } })).s, 200);
  x = await call('GET', `/api/matches/${mt.j.id}/notes`, { cookie: s4.cookie });
  assert.equal(x.j.notes[0].summary, '자기소개 연습'); assert.equal(x.j.notes[0].fbText, '잘했어요!'); assert.equal(x.j.notes[0].hwText, '저는 린입니다.');
  assert.equal((await call('GET', `/api/matches/${mt.j.id}/notes`, { cookie: te.cookie })).s, 404);
}

// ===== 음성 · 수강권 · 신고/차단 · 후기 · 관리자 =====
{
  const s5 = await login('ss5', 'ss5@example.com', 'Sora'); await call('PUT', '/api/me', { cookie: s5.cookie, body: { name: 'そら', role: 'student' } });
  const t5 = await login('tt5', 'tt5@example.com', 'Han'); await call('PUT', '/api/me', { cookie: t5.cookie, body: { name: '한선생', role: 'teacher' } });
  await call('POST', `/api/admin/users/${t5.j.id}`, { cookie: ad.cookie, body: { action: 'approve' } });
  const mt = (await call('POST', '/api/matches', { cookie: s5.cookie, body: { teacherId: t5.j.id } })).j;
  const v0 = await fetch(base + `/api/matches/${mt.id}/voice?sec=3`, { method: 'POST', headers: { cookie: s5.cookie, origin: 'https://guruguru.app', 'content-type': 'audio/webm' }, body: Buffer.alloc(500, 1) });
  assert.equal(v0.status, 409, 'voice needs accepted');
  await call('POST', `/api/matches/${mt.id}`, { cookie: t5.cookie, body: { action: 'accept' } });
  const v1 = await fetch(base + `/api/matches/${mt.id}/voice?sec=3&text=${encodeURIComponent('안녕하세요')}`, { method: 'POST', headers: { cookie: s5.cookie, origin: 'https://guruguru.app', 'content-type': 'audio/webm' }, body: Buffer.alloc(500, 1) });
  assert.equal(v1.status, 201);
  let x = await call('GET', `/api/matches/${mt.id}/messages`, { cookie: t5.cookie });
  const vm = x.j.messages.find(m => m.kind === 'voice'); assert.equal(vm.body.text, '안녕하세요');
  assert.equal((await fetch(base + '/api/voice/' + vm.body.f, { headers: { cookie: t5.cookie } })).status, 200);
  assert.equal((await fetch(base + '/api/voice/' + vm.body.f, { headers: { cookie: te.cookie } })).status, 404);
  assert.equal((await fetch(base + '/api/voice/' + vm.body.f, { headers: { cookie: t5.cookie, range: 'bytes=0-9' } })).status, 206);
  const H = 3600, b0 = Math.floor(Date.now() / 1000 / H) * H + 50 * H;
  const sl = (await call('POST', '/api/slots', { cookie: t5.cookie, body: { slots: [{ start: b0, dur: 60 }, { start: b0 + 2 * H, dur: 60 }] } })).j.slots;
  // 후기: 지난 수업 없으면 403
  assert.equal((await call('POST', `/api/teachers/${t5.j.id}/reviews`, { cookie: s5.cookie, body: { rating: 5 } })).s, 403);
  await call('POST', `/api/slots/${sl[1].id}/book`, { cookie: s5.cookie });
  { const { DatabaseSync } = await import('node:sqlite'); const d = new DatabaseSync(process.env.DB_PATH); d.prepare('UPDATE slots SET start=? WHERE id=?').run(b0 - 9 * 86400, sl[1].id); d.close(); }
  x = await call('GET', `/api/teachers/${t5.j.id}/reviews`, { cookie: s5.cookie }); assert.equal(x.j.canWrite, true);
  assert.equal((await call('POST', `/api/teachers/${t5.j.id}/reviews`, { cookie: s5.cookie, body: { rating: 9 } })).s, 400);
  assert.equal((await call('POST', `/api/teachers/${t5.j.id}/reviews`, { cookie: s5.cookie, body: { rating: 5, text: '최고!' } })).s, 200);
  x = await call('GET', `/api/teachers/${t5.j.id}`, { cookie: s5.cookie }); assert.equal(x.j.rating, 5); assert.equal(x.j.reviews, 1);
  // 신고 + 차단
  assert.equal((await call('POST', '/api/report', { cookie: s5.cookie, body: { userId: t5.j.id, matchId: mt.id, reason: 'spam', block: true } })).s, 200);
  assert.equal((await call('POST', `/api/matches/${mt.id}/messages`, { cookie: t5.cookie, body: { body: 'hi' } })).s, 409);
  x = await call('GET', '/api/teachers', { cookie: s5.cookie }); assert.ok(!x.j.teachers.some(t => t.id === t5.j.id));
  x = await call('DELETE', '/api/block', { cookie: s5.cookie, body: { userId: t5.j.id } }); assert.deepEqual(x.j.blocks, []);
  // 관리자
  assert.equal((await call('GET', '/api/admin/stats', { cookie: s5.cookie })).s, 403);
  x = await call('GET', '/api/admin/stats', { cookie: ad.cookie }); assert.ok(x.j.users > 5); assert.equal(x.j.reports, 1);
  x = await call('GET', '/api/admin/reports', { cookie: ad.cookie }); assert.equal(x.j.reports[0].reason, 'spam');
  await call('POST', `/api/admin/reports/${x.j.reports[0].id}`, { cookie: ad.cookie, body: {} });
  x = await call('POST', `/api/admin/users/${t5.j.id}`, { cookie: ad.cookie, body: { action: 'suspend' } }); assert.equal(x.j.suspended, true);
  assert.equal((await call('GET', '/api/me', { cookie: t5.cookie })).s, 401);
  assert.equal((await call('POST', '/api/auth/google', { body: { credential: tok({ sub: 'tt5', email: 'tt5@example.com' }) } })).s, 401);
  await call('POST', `/api/admin/users/${t5.j.id}`, { cookie: ad.cookie, body: { action: 'unsuspend' } });
  assert.equal((await call('POST', `/api/admin/users/${ad.j.id}`, { cookie: ad.cookie, body: { action: 'suspend' } })).s, 400);
}

// ===== 소개 사진·영상·SNS·태그 =====
{
  const t6 = await login('tt6', 'tt6@example.com', 'Yoon');
  let x = await call('PUT', '/api/me', { cookie: t6.cookie, body: { name: '윤선생', role: 'teacher', ptags: ['cheerful', 'kpop', 'BAD TAG', 'kpop'], sns: { instagram: '@yoon.korean', x: 'bad handle!!', youtube: 'https://youtu.be/abc', web: 'javascript:1' } } });
  assert.deepEqual(x.j.ptags, ['cheerful', 'kpop']); assert.deepEqual(x.j.sns, { instagram: 'yoon.korean', youtube: 'https://youtu.be/abc' });
  const jpg = Buffer.concat([Buffer.from([0xff, 0xd8, 0xff, 0xe0]), Buffer.alloc(300, 2)]);
  const up = (p, ct, b) => fetch(base + p, { method: 'POST', headers: { cookie: t6.cookie, origin: 'https://guruguru.app', 'content-type': ct }, body: b });
  let r = await up('/api/me/gallery', 'image/jpeg', jpg); assert.equal(r.status, 200); let me6 = await r.json(); assert.equal(me6.gallery.length, 1);
  const mp4 = Buffer.concat([Buffer.from([0, 0, 0, 0x18]), Buffer.from('ftypmp42'), Buffer.alloc(400, 0)]);
  r = await up('/api/me/video', 'video/mp4', mp4); assert.equal(r.status, 200); me6 = await r.json();
  { const g = await fetch(base + me6.video, { headers: { range: 'bytes=0-9' } }); assert.equal(g.status, 206); assert.equal(g.headers.get('content-type'), 'video/mp4'); }
  assert.equal((await up('/api/me/video', 'video/mp4', jpg)).status, 415);
  x = await call('DELETE', '/api/me/gallery/' + me6.gallery[0].split('/').pop(), { cookie: t6.cookie }); assert.equal(x.j.gallery.length, 0);
  const s6 = await login('ss6', 'ss6@example.com', 'Aoi');
  x = await call('PUT', '/api/me', { cookie: s6.cookie, body: { name: 'あおい', role: 'student', ptags: 'kpop,drama', sns: { instagram: 'aoi' } } });
  assert.deepEqual(x.j.ptags, ['kpop', 'drama']); assert.deepEqual(x.j.sns, undefined);
  assert.equal((await fetch(base + '/api/me/gallery', { method: 'POST', headers: { cookie: s6.cookie, origin: 'https://guruguru.app', 'content-type': 'image/jpeg' }, body: jpg })).status, 403);
}

// ===== 관리자 콘솔 =====
{
  const u7 = await login('ss7', 'ss7@example.com', 'Nao'); await call('PUT', '/api/me', { cookie: u7.cookie, body: { name: 'なお', role: 'student' } });
  let x = await call('GET', `/api/admin/users/${u7.j.id}`, { cookie: ad.cookie }); assert.equal(x.j.user.name, 'なお'); assert.ok(x.j.logins.length >= 1);
  x = await call('POST', `/api/admin/users/${u7.j.id}`, { cookie: ad.cookie, body: { action: 'grade', grade: 'gold' } }); assert.equal(x.j.grade, 'gold');
  assert.equal((await call('POST', `/api/admin/users/${u7.j.id}`, { cookie: ad.cookie, body: { action: 'grade', grade: 'king' } })).s, 400);
  x = await call('POST', `/api/admin/users/${u7.j.id}`, { cookie: ad.cookie, body: { action: 'memo', memo: '体験レッスン希望' } }); assert.equal(x.j.memo, '体験レッスン希望');
  x = await call('POST', `/api/admin/users/${u7.j.id}`, { cookie: ad.cookie, body: { action: 'makeAdmin' } }); assert.equal(x.j.admin, true);
  // 부관리자: 콘솔 접근 가능, 관리자 임명은 불가
  assert.equal((await call('GET', '/api/admin/stats', { cookie: u7.cookie })).s, 200);
  assert.equal((await call('POST', `/api/admin/users/${u7.j.id}`, { cookie: u7.cookie, body: { action: 'removeAdmin' } })).s, 403);
  assert.equal((await call('POST', `/api/admin/users/${ad.j.id}`, { cookie: ad.cookie, body: { action: 'removeAdmin' } })).s, 400);
  x = await call('GET', '/api/admin/logs', { cookie: ad.cookie }); assert.ok(x.j.logs.some(l => l.action === 'grade' && l.detail === 'gold')); assert.ok(x.j.logins.length > 3);
  x = await call('GET', '/api/admin/matches', { cookie: ad.cookie }); assert.ok(x.j.matches.length > 0);
  x = await call('GET', '/api/admin/lessons', { cookie: ad.cookie }); assert.ok(Array.isArray(x.j.lessons));
  x = await call('GET', '/api/admin/stats', { cookie: ad.cookie }); assert.ok(Array.isArray(x.j.signups));
  await call('POST', `/api/admin/users/${u7.j.id}`, { cookie: ad.cookie, body: { action: 'removeAdmin' } });
  assert.equal((await call('GET', '/api/admin/stats', { cookie: u7.cookie })).s, 403);
}
console.log('api tests: all passed');
server.close(); jw.close(); fs.rmSync(dir, { recursive: true });
process.exit(0);
