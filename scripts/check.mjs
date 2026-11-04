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
if (/\/\*__(LESSONS|PRINT|MASCOT|APP|AUDIO)__\*\//.test(html)) errs.push('unreplaced placeholder in index.html');
const js = html.slice(html.indexOf('<script>') + 8, html.lastIndexOf('</script>'));
try { new vm.Script(js); } catch (e) { errs.push(`index.html script syntax: ${e.message}`); }
try { new vm.Script(fs.readFileSync(path.join(dist, 'sw.js'), 'utf8')); } catch (e) { errs.push(`sw.js syntax: ${e.message}`); }
try { JSON.parse(fs.readFileSync(path.join(dist, 'manifest.webmanifest'), 'utf8')); } catch (e) { errs.push(`manifest JSON: ${e.message}`); }

// lessons + audio + pdf coverage
const ctx = {};
vm.runInNewContext(fs.readFileSync(path.join(root, 'src', 'lessons.js'), 'utf8').replace('const L=', 'globalThis.L='), ctx);
const L = ctx.L || [];
if (!L.length) errs.push('no lessons');
const audioMap = JSON.parse(fs.readFileSync(path.join(root, 'src', 'audio-map.json'), 'utf8'));
for (const h of new Set(Object.values(audioMap))) must(`audio/${h}.mp3`);
for (const l of L) for (const t of ['text', 'guide', 'work', 'hw']) must(`pdf/l${l.no}-${t}.pdf`);
for (const l of L) {
  if (!l.quiz?.length) errs.push(`lesson ${l.no}: no quiz`);
  l.quiz?.forEach((q, i) => { if (!(q.a >= 0 && q.a < q.o.length)) errs.push(`lesson ${l.no} Q${i + 1}: answer index out of range`); });
}

if (errs.length) { console.error('✗ check failed\n' + errs.map(e => '  - ' + e).join('\n')); process.exit(1); }
console.log(`✓ check passed · ${L.length} lessons · ${new Set(Object.values(audioMap)).size} audio · ${L.length * 4} pdf`);
