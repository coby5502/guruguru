#!/usr/bin/env bash
# ぐるぐる API 서버 설치 (cobyserver 에서 한 번 실행)
#   Mac:  (server/keys/ 에 CI 배포용 공개키가 들어 있어야 함 — README 참고)
#         scp -r ~/guruguru/server coby@cobyserver.iptime.org:~/guruguru-api-setup
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

# 로그인 설정(GOOGLE_CLIENT_ID·ADMIN_EMAILS·ORIGINS)은 GitHub Environment 변수 → CI 가 code/config.json 으로 배포
for e in prod dev; do
  [ -f "$DIR/$e/.env" ] || { umask 077; printf 'DB_PATH=/data/guruguru.db\nSITE_DIR=/site\nPORT=8787\n' > "$DIR/$e/.env"; }
done
chmod 600 "$DIR"/{prod,dev}/.env

say "컨테이너 시작"
cd "$DIR" && docker compose pull -q && docker compose up -d
sleep 3
for c in guruguru-api guruguru-api-dev; do
  printf '  %s: ' "$c"; docker exec "$c" wget -qO- http://127.0.0.1:8787/api/config || echo "(실패 — docker logs $c 확인)"; echo
done

say "CI 배포 키 등록 (Mac 에서 만든 공개키 → rrsync 로 code 폴더에만 쓰기)"
RR="$(command -v rrsync || ls /usr/bin/rrsync /usr/share/doc/rsync/scripts/rrsync 2>/dev/null | head -1 || true)"
[ -n "$RR" ] || { echo "  rrsync 가 없습니다 (sudo apt install rsync)"; exit 1; }
for e in prod dev; do
  PUB="$SRC/keys/guruguru-api-$e.pub"
  [ -f "$PUB" ] || { echo "  $PUB 없음 — 건너뜀"; continue; }
  if grep -qF "$(awk '{print $2}' "$PUB")" "$HOME/.ssh/authorized_keys" 2>/dev/null; then echo "  $e: 이미 등록됨"
  else echo "command=\"$RR $DIR/$e/code\",restrict $(cat "$PUB")" >> "$HOME/.ssh/authorized_keys"; echo "  $e: 등록"; fi
done

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
