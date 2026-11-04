// Post-deploy smoke test: node scripts/smoke.mjs https://guruguru.app [expected-build]
const [base, expect] = process.argv.slice(2);
const get = async p => { const r = await fetch(base + p, { redirect: 'follow' }); return { s: r.status, t: await r.text() }; };
let ok = false, last = '';
for (let i = 0; i < 12 && !ok; i++) {
  try {
    const r = await get('/');
    const m = r.t.match(/<meta name="build" content="([^"]+)"/);
    last = `${r.s} ${m ? m[1] : '-'}`;
    ok = r.s === 200 && (!expect || (m && m[1] === expect));
  } catch (e) { last = e.message; }
  if (!ok) await new Promise(r => setTimeout(r, 5000));
}
if (!ok) { console.error(`✗ ${base} not serving expected build (${expect || 'any'}): ${last}`); process.exit(1); }
for (const p of ['/sw.js', '/manifest.webmanifest', '/icons/icon-192.png', '/pdf/l1-text.pdf']) {
  const r = await fetch(base + p, { method: 'HEAD' });
  if (r.status !== 200) { console.error(`✗ ${p} → ${r.status}`); process.exit(1); }
}
console.log(`✓ ${base} serving ${last}`);
