# 배포·브랜치 전략

| 브랜치 | 용도 | 배포 |
|---|---|---|
| `main` | 운영. PR 로만 변경 (develop / hotfix/* / release/*) | **https://guruguru.app** (자동) |
| `develop` | 통합·검증. 직접 push 또는 feature PR | **https://dev.guruguru.app** (자동) |
| `feature/*`, `fix/*` | 작업 브랜치 → develop 으로 PR | CI 만 |
| `hotfix/*` | 운영 긴급 수정 → main 으로 PR | 머지 후 main→develop 자동 동기화 |

## 흐름

```
feature/xxx ──PR──▶ develop ──(자동)──▶ dev.guruguru.app
                       │
                       └──PR (Merge commit)──▶ main ──(자동)──▶ guruguru.app
```

- PR 마다 **CI**(`ci` 체크: 빌드 + 검사)가 돌고, 통과해야 main 에 머지할 수 있습니다.
- develop → main 은 **Create a merge commit** 으로 머지하세요 (develop 히스토리를 유지해야 자동 동기화가 깔끔합니다).
- 배포 후 실제 사이트가 새 빌드(`<meta name="build">`)를 내보내는지 스모크 테스트로 확인합니다.
- 수동 배포/재배포: Actions → Deploy → *Run workflow* (production 은 main 에서만).
- 롤백: main 에서 문제 커밋을 `git revert` → PR → 머지.

## 로컬

```sh
npm run build        # dist/ 생성 (prod)
npm run build:dev    # dev 빌드 (noindex, [DEV] 타이틀)
npm run check        # 검사
npm run serve        # http://localhost:5173
npm run pdf          # PDF 재생성 (playwright 필요)
python3 scripts/gen-audio.py "새 단어"   # 음성 추가 (Supertonic-3)
```

## 교안 추가하기

1. `src/lessons-ext/stepN-*.js` 에 `L.push({...})` 로 회차 추가 + 같은 파일에 `KO_EXT`(교사용 한국어), `KOQ_EXT`(퀴즈 한국어), `TBL_EXT`, `TCOLS_EXT`
2. 새 단어·문장 음성: `python3 scripts/gen-audio.py "문장" ...`
3. PDF: `npm run build && npm run pdf -- 17 18 19`
4. `npm run check` 가 KO/퀴즈 누락, 60분 합계, 음성·PDF 파일 유무를 검사

## 구조

- `src/` — 앱 소스 (template.html, app.js, print.js, lessons.js, audio-map.json, sw.js)
- `public/` — 정적 파일 (audio/, pdf/, icons/, manifest)
- `scripts/` — build / check / smoke / pdf / gen-audio
- 서버: cobyserver `~/sites/guruguru`(prod), `~/sites/guruguru-dev`(dev) → NPM → `cobyhub-web-gateway` :8083 / :8084
