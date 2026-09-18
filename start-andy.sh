#!/usr/bin/env bash
# Run the real Andy AI locally: the API (with live web browsing) + the Hub.
set -euo pipefail
cd "$(dirname "$0")"

if [ ! -f andy-api/.env ]; then
  echo "No andy-api/.env — copy andy-api/.env.example and add OPENROUTER_API_KEY"; exit 1
fi

echo "==> starting andy-api on :8080"
(cd andy-api && node server.js > /tmp/andyapi.log 2>&1 &)
sleep 2
curl -s localhost:8080/health >/dev/null && echo "    api ok" || { echo "    api failed — see /tmp/andyapi.log"; exit 1; }

echo "==> starting the Hub on :5175 with live AI"
VITE_ANDY_MOCK=0 VITE_ANDY_API=http://localhost:8080 npx vite --port 5175 --strictPort
