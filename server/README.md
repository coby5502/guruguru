# ぐるぐる API (로그인 · 역할)

Google 로그인 → 프로필(이름·역할·수준) → **학생 화면 / 선생님 화면**.
선생님은 관리자 승인 후 교사용 지도안·수업 흐름·지도 메모가 열립니다.

- `server.mjs` — 의존성 없는 Node(22.13+) 서버, SQLite(`node:sqlite`)
- `compose.yml` — `guruguru-api`(prod) · `guruguru-api-dev`(dev), NPM 네트워크에 붙음
- `setup.sh` — cobyserver 에서 한 번 실행하는 설치 스크립트
- `test.mjs` — `node server/test.mjs` (CI 에서도 실행)

백엔드가 없으면(`/api/config` 가 404) 앱은 예전처럼 로그인 없이 동작합니다.
그러니 아래 설정을 마치기 전까지 배포해도 사이트는 그대로입니다.

## 1. Google OAuth 클라이언트 만들기 (한 번)

1. https://console.cloud.google.com → 프로젝트 만들기 (예: `guruguru`)
2. **Google 인증 플랫폼 → 브랜딩**: 앱 이름 `ぐるぐる`, 지원 이메일 입력
3. **대상**: 사용자 유형 `외부` → 게시 상태를 **프로덕션으로 게시**
   (테스트 상태로 두면 등록한 테스트 사용자만 로그인 가능. 범위는 기본 `openid·email·profile` 뿐이라 별도 심사 없음)
4. **클라이언트 → 클라이언트 만들기 → 웹 애플리케이션**
   - 승인된 JavaScript 원본: `https://guruguru.app`, `https://dev.guruguru.app`
   - 승인된 리디렉션 URI: `https://guruguru.app/api/auth/google/redirect`, `https://dev.guruguru.app/api/auth/google/redirect`
5. 만들어진 **클라이언트 ID**(`…apps.googleusercontent.com`)를 복사. 클라이언트 보안 비밀번호는 쓰지 않습니다.

## 2. GitHub Environment 설정

설정값은 서버가 아니라 GitHub에 둡니다. Settings → Environments → `production` / `development` 각각에 넣어요:

| 종류 | 이름 | 값 |
|---|---|---|
| Secret | `API_DEPLOY_SSH_KEY` | CI → 서버 API 코드 폴더 전용 rrsync 키 (등록 완료) |
| Variable | `GOOGLE_CLIENT_ID` | 1번에서 만든 클라이언트 ID |
| Variable | `ADMIN_EMAILS` | 선생님 승인 권한을 줄 Google 이메일 (쉼표 구분) |

배포 때 CI가 이 값으로 `config.json`을 만들어 `server.mjs`와 함께 서버에 올립니다. `ORIGINS`는 환경에 맞춰 자동으로 들어가요. 서버는 파일이 바뀌면 자동으로 재시작합니다.

```sh
gh variable set GOOGLE_CLIENT_ID --env development --body "…apps.googleusercontent.com"
gh variable set ADMIN_EMAILS    --env development --body "me@gmail.com"
```

배포 키는 Mac 에서 만들어 GitHub에 넣었고, 공개키는 `server/keys/`에 있어요(git 제외). 이 공개키는 서버 설치 때 함께 올라갑니다.

## 3. 서버 설치 (한 번)

Mac 터미널에서 (서버 비밀번호를 직접 입력):

```sh
cd ~/guruguru && git pull
scp -r server coby@cobyserver.iptime.org:~/guruguru-api-setup
ssh -t coby@cobyserver.iptime.org 'bash ~/guruguru-api-setup/setup.sh'
```

스크립트가 하는 일:

1. NPM 컨테이너의 Docker 네트워크를 찾습니다.
2. `~/apps/guruguru-api`에 prod·dev 컨테이너를 띄웁니다.
3. 배포 공개키를 rrsync 제한으로 등록합니다.
4. NPM에 붙일 설정을 출력합니다.

설치가 끝나면 `gh workflow run deploy.yml -f environment=development`로 dev 배포를 한 번 돌려 설정을 올려 주세요.

## 4. Nginx Proxy Manager

`dev.guruguru.app` Proxy Host → **Advanced** 에 스크립트가 출력한 설정을 붙여넣습니다.
붙여넣는 설정은 두 부분이에요:

- `/api/`를 `guruguru-api-dev`로 넘기는 설정
- 지도안 PDF를 선생님에게만 내보내는 설정

설정한 뒤 dev 에서 로그인 → 선생님 신청 → 승인까지 확인하고, 같은 설정(이름만 `guruguru-api`)을 `guruguru.app` 에 넣습니다.

## 현재 상태 (2026-11-06)

- Google Cloud 프로젝트 `guruguru-513906` (coby5502@gmail.com) · 동의 화면 프로덕션 게시
- NPM Proxy Host: guruguru.app(id 7) → `guruguru-api`, dev.guruguru.app(id 8) → `guruguru-api-dev` (Advanced 설정)
- NPM 관리 화면은 서버 내부(:81)에서만 열림 → `ssh -N -L 8181:127.0.0.1:81 coby@cobyserver.iptime.org` 후 http://localhost:8181

## 운영

- **승인:** 관리자 이메일로 로그인한 뒤 마이 → `선생님 승인`에서 승인·반려합니다.
- **백업:** `~/apps/guruguru-api/prod/data/guruguru.db`를 백업합니다(SQLite WAL 모드). 예: `sqlite3 guruguru.db ".backup b.db"`.
- **로그:** `docker logs guruguru-api`
- **설정 변경:** GitHub Environment 변수를 바꾸고 Deploy 를 다시 실행합니다.
- **저장하는 정보:**
  - Google에서 받는 것: sub, 이메일, 이름, 프로필 사진 URL
  - 사용자가 입력하는 것: 표시 이름, 역할, 수준, 목적, 소개
  - 세션 토큰은 해시로만 저장합니다.
  - 마이 → 계정 삭제를 누르면 즉시 지워집니다.
