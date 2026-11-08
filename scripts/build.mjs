// Build: src/ + public/ → dist/  (no dependencies)
// Usage: node scripts/build.mjs [--env=prod|dev] [--version=abc123]
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const arg = (k, d) => (process.argv.find(a => a.startsWith(`--${k}=`)) || '').split('=')[1] || d;
const ENV = arg('env', process.env.BUILD_ENV || 'prod');
let VERSION = arg('version', process.env.BUILD_VERSION || '');
if (!VERSION) { try { VERSION = execSync('git rev-parse --short=8 HEAD').toString().trim(); } catch { VERSION = Date.now().toString(36); } }

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const src = f => fs.readFileSync(path.join(root, 'src', f), 'utf8');
const dist = path.join(root, 'dist');

fs.rmSync(dist, { recursive: true, force: true });
fs.cpSync(path.join(root, 'public'), dist, { recursive: true });

const plusFiles = fs.existsSync(path.join(root, 'src', 'lessons-plus')) ? fs.readdirSync(path.join(root, 'src', 'lessons-plus')).filter(f => f.endsWith('.js')).sort() : [];
const extFiles = fs.existsSync(path.join(root, 'src', 'lessons-ext')) ? fs.readdirSync(path.join(root, 'src', 'lessons-ext')).filter(f => f.endsWith('.js')).sort() : [];
const audioMap = JSON.parse(src('audio-map.json'));
let app = src('app.js').replace('/*__AUDIO__*/{}', JSON.stringify(audioMap));
let html = src('template.html')
  .replace('/*__LESSONS__*/', () => [src('lessons.js'), ...extFiles.map(f => src('lessons-ext/' + f)), ...plusFiles.map(f => src('lessons-plus/' + f))].join('\n'))
  .replace('/*__SYLLABUS__*/', () => src('syllabus.js'))
  .replace('/*__PRINT__*/', () => src('print.js'))
  .replace('/*__MASCOT__*/', () => src('kana.js') + '\n' + src('mascot.js'))
  .replace('/*__APP__*/', () => src('auth.js') + '\n' + app);
if (ENV !== 'prod') {
  html = html
    .replace('<meta charset="utf-8">', '<meta charset="utf-8">\n<meta name="robots" content="noindex,nofollow">')
    .replace(/<title>/, '<title>[DEV] ');
}
html = html.replace('</head>', `<meta name="build" content="${ENV}-${VERSION}">\n</head>`);
fs.writeFileSync(path.join(dist, 'index.html'), html);

const audioFiles = fs.readdirSync(path.join(dist, 'audio')).filter(f => f.endsWith('.mp3')).sort().map(f => `audio/${f}`);
const sw = src('sw.js').replace('__VERSION__', `${ENV}-${VERSION}`).replace('__AUDIO_FILES__', JSON.stringify(audioFiles));
fs.writeFileSync(path.join(dist, 'sw.js'), sw);

console.log(`built dist/ (${ENV}-${VERSION}) · audio ${audioFiles.length} · html ${(html.length / 1024).toFixed(0)}KB`);
