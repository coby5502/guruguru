// Validate dist/ before deploy. Exits 1 on any problem.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const dist = path.join(root, 'dist');
const errs = [];
const must = f => { if (!fs.existsSync(path.join(dist, f))) errs.push(`missing: ${f}`); };

['index.html', 'sw.js', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png', 'icons/apple-touch-icon.png', 'icons/icon-maskable-192.png', 'icons/favicon.svg', 'icons/favicon-32.png'].forEach(must);

const html = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
if (/\/\*__(LESSONS|SYLLABUS|PRINT|MASCOT|APP|AUDIO)__\*\//.test(html)) errs.push('unreplaced placeholder in index.html');
const js = html.slice(html.indexOf('<script>') + 8, html.lastIndexOf('</script>'));
try { new vm.Script(js); } catch (e) { errs.push(`index.html script syntax: ${e.message}`); }
try { new vm.Script(fs.readFileSync(path.join(dist, 'sw.js'), 'utf8')); } catch (e) { errs.push(`sw.js syntax: ${e.message}`); }
try { JSON.parse(fs.readFileSync(path.join(dist, 'manifest.webmanifest'), 'utf8')); } catch (e) { errs.push(`manifest JSON: ${e.message}`); }

// lessons + audio + pdf coverage
const ctx = {};
const extDir = path.join(root, 'src', 'lessons-ext');
const extSrc = fs.existsSync(extDir) ? fs.readdirSync(extDir).filter(f => f.endsWith('.js')).sort().map(f => fs.readFileSync(path.join(extDir, f), 'utf8')).join('\n') : '';
vm.runInNewContext(fs.readFileSync(path.join(root, 'src', 'lessons.js'), 'utf8').replace('const L=', 'globalThis.L=') + '\n' + extSrc + "\n;globalThis.__x={KO:typeof KO_EXT!=='undefined'?KO_EXT:{},KOQ:typeof KOQ_EXT!=='undefined'?KOQ_EXT:{}};", ctx);
const L = ctx.L || [];
if (!L.length) errs.push('no lessons');
const audioMap = JSON.parse(fs.readFileSync(path.join(root, 'src', 'audio-map.json'), 'utf8'));
for (const h of new Set(Object.values(audioMap))) must(`audio/${h}.mp3`);
for (const l of L) for (const t of ['text', 'guide', 'work', 'hw']) must(`pdf/l${l.no}-${t}.pdf`);
const nos = L.map(l => l.no); if (new Set(nos).size !== nos.length) errs.push('duplicate lesson numbers');
for (const l of L.filter(l => l.no > 8)) {
  if (!ctx.__x.KO[l.no]) errs.push(`lesson ${l.no}: missing Korean teacher data (KO_EXT)`);
  else if (ctx.__x.KO[l.no].flow.length !== l.flow.length) errs.push(`lesson ${l.no}: KO flow length mismatch`);
  if (!ctx.__x.KOQ[l.no] || ctx.__x.KOQ[l.no].length !== l.quiz.length) errs.push(`lesson ${l.no}: KOQ mismatch`);
  if (l.flow.reduce((s, f) => s + f[0], 0) !== 60) errs.push(`lesson ${l.no}: flow is not 60 min`);
}
for (const l of L) {
  if (!l.quiz?.length) errs.push(`lesson ${l.no}: no quiz`);
  l.quiz?.forEach((q, i) => { if (!(q.a >= 0 && q.a < q.o.length)) errs.push(`lesson ${l.no} Q${i + 1}: answer index out of range`); });
}

// syllabus continuity
{ const sctx = {}; vm.runInNewContext(fs.readFileSync(path.join(root, 'src', 'syllabus.js'), 'utf8').replace('const SYL=', 'globalThis.SYL='), sctx);
  let next = 9; for (let n = 1; n <= 6; n++) { const s = sctx.SYL[n]; if (s.from !== next) errs.push(`syllabus step ${n} starts at ${s.from}, expected ${next}`); next = s.from + s.items.length; s.items.forEach((x, i) => { if (x.length !== 3 || x.some(v => !v)) errs.push(`syllabus ${s.from + i}: incomplete`); }); }
  if (next !== 291) errs.push(`syllabus ends at ${next - 1}, expected 290`); }

if (errs.length) { console.error('✗ check failed\n' + errs.map(e => '  - ' + e).join('\n')); process.exit(1); }
console.log(`✓ check passed · ${L.length} lessons · ${new Set(Object.values(audioMap)).size} audio · ${L.length * 4} pdf`);
