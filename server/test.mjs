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
const { server } = await import('./server.mjs');
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
console.log('api tests: all passed');
server.close(); jw.close(); fs.rmSync(dir, { recursive: true });
process.exit(0);
