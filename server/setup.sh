#!/usr/bin/env bash
# ぐるぐる API 서버 설치 (cobyserver 에서 한 번 실행)
#   Mac:  scp -r ~/guruguru/server coby@cobyserver.iptime.org:~/guruguru-api-setup
#         ssh -t coby@cobyserver.iptime.org 'bash ~/guruguru-api-setup/setup.sh'
# 다시 실행해도 안전합니다(기존 .env·DB 는 그대로 둠).
set -euo pipefail
SRC="$(cd "$(dirname "$0")" && pwd)"
DIR="$HOME/apps/guruguru-api"
say(){ printf '\n\033[1;35m▶ %s\033[0m\n' "$*"; }

command -v docker >/dev/null || { echo "docker 가 필요합니다"; exit 1; }
docker compose version >/dev/null 2>&1 || { echo "docker compose 플러그인이 필요합니다"; exit 1; }

say "Nginx Proxy Manager 컨테이너·네트워크 찾기"
NPM_C="$(docker ps --format '{{.Names}} {{.Image}}' | awk 'tolower($2) ~ /nginx-proxy-manager/ {print $1; exit}')"
[ -n "$NPM_C" ] || { read -rp "NPM 컨테이너 이름: " NPM_C; }
NPM_NET="$(docker inspect -f '{{range $k,$v := .NetworkSettings.Networks}}{{$k}} {{end}}' "$NPM_C" | awk '{print $1}')"
echo "  NPM: $NPM_C  network: $NPM_NET"
GW="$(docker ps --format '{{.Names}}' | grep -m1 -i 'web-gateway' || true)"
[ -n "$GW" ] && echo "  사이트 게이트웨이: $GW"

say "폴더 준비: $DIR"
mkdir -p "$DIR"/{prod,dev}/{code,data}
cp "$SRC/compose.yml" "$DIR/compose.yml"
for e in prod dev; do cp "$SRC/server.mjs" "$DIR/$e/code/server.mjs"; done
SITE_PROD="${SITE_PROD:-$HOME/sites/guruguru}"; SITE_DEV="${SITE_DEV:-$HOME/sites/guruguru-dev}"
cat > "$DIR/.env" <<ENV
NPM_NETWORK=$NPM_NET
APP_UID=$(id -u)
APP_GID=$(id -g)
SITE_PROD=$SITE_PROD
SITE_DEV=$SITE_DEV
ENV

if [ ! -f "$DIR/prod/.env" ] || [ ! -f "$DIR/dev/.env" ]; then
  say "Google OAuth 클라이언트 ID / 관리자 이메일"
  read -rp "GOOGLE_CLIENT_ID (…apps.googleusercontent.com): " CID
  read -rp "관리자 이메일 (쉼표로 여러 개): " ADM
  for e in prod dev; do
    [ -f "$DIR/$e/.env" ] && continue
    ORI=$([ $e = prod ] && echo https://guruguru.app || echo https://dev.guruguru.app)
    umask 077; cat > "$DIR/$e/.env" <<ENV
GOOGLE_CLIENT_ID=$CID
ADMIN_EMAILS=$ADM
ORIGINS=$ORI
DB_PATH=/data/guruguru.db
SITE_DIR=/site
PORT=8787
ENV
  done
fi
chmod 600 "$DIR"/{prod,dev}/.env

say "컨테이너 시작"
cd "$DIR" && docker compose pull -q && docker compose up -d
sleep 3
for c in guruguru-api guruguru-api-dev; do
  printf '  %s: ' "$c"; docker exec "$c" wget -qO- http://127.0.0.1:8787/api/config || echo "(실패 — docker logs $c 확인)"; echo
done

say "CI 자동 배포용 키 (선택)"
if command -v rrsync >/dev/null 2>&1 || [ -x /usr/bin/rrsync ]; then
  RR="$(command -v rrsync || echo /usr/bin/rrsync)"
  for e in prod dev; do
    K="$HOME/.ssh/guruguru-api-$e"
    [ -f "$K" ] || ssh-keygen -q -t ed25519 -N '' -C "guruguru-api-$e-deploy" -f "$K"
    LINE="command=\"$RR $DIR/$e/code\",restrict $(cat "$K.pub")"
    grep -qF "$(cat "$K.pub")" "$HOME/.ssh/authorized_keys" 2>/dev/null || echo "$LINE" >> "$HOME/.ssh/authorized_keys"
  done
  echo "  GitHub → Settings → Environments 에 API_DEPLOY_SSH_KEY 로 등록:"
  echo "    production : cat ~/.ssh/guruguru-api-prod"
  echo "    development: cat ~/.ssh/guruguru-api-dev"
  echo "  (등록 후 서버의 개인키 파일은 지워도 됩니다)"
else
  echo "  rrsync 가 없어 건너뜀 — 서버 코드는 이 스크립트를 다시 실행해 갱신하세요"
fi

say "Nginx Proxy Manager 설정 (guruguru.app / dev.guruguru.app 각각)"
cat <<NPMCONF
  Proxy Host 편집 → Advanced 탭 → Custom Nginx Configuration 에 붙여넣기
  (dev.guruguru.app 에는 guruguru-api 를 guruguru-api-dev 로 바꿔서)

location /api/ {
    proxy_pass http://guruguru-api:8787;
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-Proto \$scheme;
    proxy_read_timeout 30s;
}
# 교사용 지도안 PDF 는 승인된 선생님에게만
location ~ ^/pdf/[^/]+-guide\.pdf\$ {
    proxy_pass http://guruguru-api:8787;
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
}
NPMCONF
say "완료"
