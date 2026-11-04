# かんこくご教室 / 한국어 교실

ハングルゼロからTOPIK 6級まで — 日本語話者のための韓国語学習ウェブアプリ（日本語／한국어）。

**https://guruguru.app/**

## 배포

- `main`에 push하면 GitHub Actions(`.github/workflows/deploy.yml`)가 cobyserver의 `~/sites/guruguru`로 rsync 배포합니다.
- 서버: Nginx Proxy Manager `guruguru.app` → `cobyhub-web-gateway:8083` (`/srv/guruguru`), Let's Encrypt SSL.
- DNS: Cloudflare `guruguru.app` / `www` → CNAME `cobyserver.iptime.org` (DNS only).

音声: Supertonic-3 (Supertone, OpenRAIL-M) で生成。
