// Regenerate printable PDFs from the built app (needs: npm i -D playwright && npx playwright install chromium)
// Usage: npm run build && npm run pdf [-- 9 10 11]   (lesson numbers; default all)
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { chromium } from 'playwright';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const dist = path.join(root, 'dist');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.mp3': 'audio/mpeg', '.pdf': 'application/pdf', '.webmanifest': 'application/manifest+json' };
const server = http.createServer((q, s) => {
  const f = path.join(dist, decodeURIComponent(q.url.split('?')[0]).replace(/\/$/, '/index.html'));
  if (!f.startsWith(dist) || !fs.existsSync(f)) { s.writeHead(404); return s.end(); }
  s.writeHead(200, { 'Content-Type': types[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(s);
}).listen(0);
const port = server.address().port;
const extDir = path.join(root, 'src/lessons-ext');
const extSrc = fs.existsSync(extDir) ? fs.readdirSync(extDir).filter(f => f.endsWith('.js')).sort().map(f => fs.readFileSync(path.join(extDir, f), 'utf8')).join('\n') : '';
const args = process.argv.slice(2);
const bundles = args.includes('bundles');
const only = args.map(Number).filter(Boolean);
const ctx = {}; vm.runInNewContext(fs.readFileSync(path.join(root, 'src/lessons.js'), 'utf8').replace('const L=', 'globalThis.L=') + '\n' + extSrc, ctx);
const b = await chromium.launch(); const p = await b.newPage();
await p.addInitScript(() => { try { localStorage.setItem('kk-lang', '"ja"'); } catch {} });
if (!bundles || only.length) for (const l of ctx.L.filter(l => !only.length || only.includes(l.no))) for (const t of ['text', 'guide', 'work', 'hw']) {
  await p.goto(`http://localhost:${port}/#/print/${l.no}/${t}`); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(300);
  await p.emulateMedia({ media: 'print' });
  await p.pdf({ path: path.join(root, 'public/pdf', `l${l.no}-${t}.pdf`), format: 'A4', printBackground: true, preferCSSPageSize: true, margin: { top: 0, bottom: 0, left: 0, right: 0 } });
  await p.emulateMedia({ media: 'screen' });
  console.log(`pdf l${l.no}-${t}`);
}
if (bundles) for (let sn = 0; sn <= 6; sn++) for (const t of ['text', 'guide', 'work', 'hw']) {
  await p.goto(`http://localhost:${port}/#/print/s${sn}/${t}`, { timeout: 120000 }); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(800);
  await p.emulateMedia({ media: 'print' });
  await p.pdf({ path: path.join(root, 'public/pdf', `step${sn}-${t}.pdf`), format: 'A4', printBackground: true, preferCSSPageSize: true, margin: { top: 0, bottom: 0, left: 0, right: 0 }, timeout: 0 });
  await p.emulateMedia({ media: 'screen' });
  console.log(`pdf step${sn}-${t}`);
}
await b.close(); server.close();
