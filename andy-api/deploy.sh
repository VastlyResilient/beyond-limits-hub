#!/usr/bin/env bash
# One-command deploy for andy-api, then re-point the published Hub at it.
# Requires: railway CLI logged in (railway login) OR RAILWAY_TOKEN set.
set -euo pipefail

cd "$(dirname "$0")/andy-api"

echo "==> Deploying andy-api to Railway"
railway init --name andy-api 2>/dev/null || true
railway variables set \
  OPENROUTER_API_KEY="${OPENROUTER_API_KEY:?set OPENROUTER_API_KEY first}" \
  ALLOWED_ORIGINS="https://vastlyresilient.github.io,http://localhost:5173" \
  MONTHLY_CAP_USD=10
railway up --detach
DOMAIN=$(railway domain | tail -1 | tr -d '[:space:]')
echo "==> API is at https://$DOMAIN"
curl -s "https://$DOMAIN/health" && echo

echo "==> Rebuilding the Hub against the real API"
cd ..
rm -rf dist
VITE_ANDY_MOCK=0 VITE_ANDY_API="https://$DOMAIN" npx vite build --base=/beyond-limits-hub/
cd dist && git init -q && git add -A \
  && git -c user.email=agent@zilla -c user.name=Zilla commit -qm "deploy: live AI" \
  && git push -f https://github.com/VastlyResilient/beyond-limits-hub.git HEAD:gh-pages
echo "==> Done. Verify: https://vastlyresilient.github.io/beyond-limits-hub/"
