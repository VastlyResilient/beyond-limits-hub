# HANDOFF — Deploy andy-api to Railway + republish the Hub with live AI

Target: make https://vastlyresilient.github.io/beyond-limits-hub/ talk to a real
DeepSeek-flash-4.1 model with live web browsing, instead of the canned mock replies.

Everything below is verified state as of 2026-09-21 05:25 ET. Read the PITFALLS
section before you start — three of them will silently waste your time.

================================================================================
0. WHAT IS ALREADY DONE (do not redo)
================================================================================

- `andy-api/` is a complete, tested Express service. 38 vitest tests pass.
  Endpoints: GET /health, POST /api/chat (streaming), POST /api/fetch, POST /api/memory.
- Live web browsing IS implemented (OpenRouter `plugins:[{id:"web"}]`) and verified
  against the real model — it returns real citations.
- The client-side OAuth bug that blocked Railway login is FIXED (see PITFALL 1).
  Railway is authenticated as bobbyatf@gmail.com.
- The Hub is built and published, but with VITE_ANDY_MOCK=1 (demo mode).
  Confirmed: the deployed bundle contains the string "Demo mode".

================================================================================
1. PREREQUISITES — Railway auth
================================================================================

The Railway CLI needs a valid session. Verify first:

    railway whoami

If it says "Unauthorized" (or "Not logged in"), authenticate ONE of these ways:

  (a) Preferred, interactive:
        railway login
      Opens a browser; approve, then `railway whoami` must print the email.

  (b) Headless / no browser:
        railway login --browserless
      Prints a URL + code; open the URL, enter the code.

  (c) If you have a Railway account token (railway.com/account/tokens):
        export RAILWAY_API_TOKEN="<token>"
      NOTE: the env var MUST be RAILWAY_API_TOKEN (account token).
      RAILWAY_TOKEN is for PROJECT tokens only and will fail with "Unauthorized".

DO NOT rely on the cached OAuth token at ~/.zilla/mcp-tokens/railway.json —
it expires 60 minutes after issue and the CLI cannot refresh it.

================================================================================
2. DEPLOY THE API
================================================================================

Source of truth is the LOCAL directory ~/beyond-limits-hub/andy-api
(it is a subdirectory of the beyond-limits-hub git repo).

** Deploy by uploading the local directory — do NOT deploy from GitHub. **
The standalone repo VastlyResilient/andy-api exists but may be stale, and the
hub repo would need a root-directory override. `railway up` sidesteps both.

    cd ~/beyond-limits-hub/andy-api

    # create + link a project (skip if already linked)
    railway init --name andy-api

    # upload the current directory and build from ./Dockerfile
    railway up --detach

`railway.json` in this directory already pins builder=DOCKERFILE and
startCommand="node server.js", so no extra config is needed.

`.env` and `node_modules` are gitignored, so they are NOT uploaded — good.
You will set the real variables explicitly in step 3.

================================================================================
3. SET ENVIRONMENT VARIABLES
================================================================================

Read the real key from the local file (NEVER print it, NEVER commit it):

    cd ~/beyond-limits-hub/andy-api
    OPENROUTER_KEY="$(grep -E '^OPENROUTER_API_KEY=' .env | cut -d= -f2-)"
    test -n "$OPENROUTER_KEY" || { echo "missing key"; exit 1; }

    railway variables set \
      OPENROUTER_API_KEY="$OPENROUTER_KEY" \
      ALLOWED_ORIGINS="https://vastlyresilient.github.io,http://localhost:5173" \
      MONTHLY_CAP_USD=10

Notes:
- `ANDY_SHARED_SECRET` appears in .env.example but the code never reads it. Skip it.
- Do NOT set PORT — Railway injects it.
- ALLOWED_ORIGINS must include the Pages ORIGIN ONLY (scheme + host, no path).

================================================================================
4. GENERATE A PUBLIC DOMAIN
================================================================================

    railway domain

Prints something like  andy-api-production-a1b2.up.railway.app
Capture it:

    DOMAIN="$(railway domain | tail -1 | tr -d '[:space:]')"
    echo "https://$DOMAIN"

IMPORTANT: the client has a hardcoded fallback in
`src/lib/andyConfig.ts` -> PRODUCTION_API = "https://andy-api.up.railway.app".
Railway will almost certainly give you a DIFFERENT random subdomain.
Do not try to force that exact name. Instead pass the real domain at build time
(step 6). If you prefer the fallback to be correct too, edit that constant to
the real domain and commit — but step 6 alone is sufficient.

================================================================================
5. VERIFY THE API (must pass before touching the Hub)
================================================================================

Health:

    curl -s "https://$DOMAIN/health"

Expect a 200 with JSON, e.g. {"ok":true,...}

Real model + LIVE WEB BROWSING (this is the whole point — run it):

    curl -s -N -X POST "https://$DOMAIN/api/chat" \
      -H 'Content-Type: application/json' \
      -d '{"mode":"assistant","messages":[{"role":"user","content":"What is the latest news about Stamford Connecticut today?"}]}'

PASS CRITERIA:
  - HTTP 200 and a streamed answer.
  - The answer contains CURRENT information and at least one real source line
    beginning "Sources:" with a real URL/domain.
  - If it returns generic memorized prose with no sources, web browsing is NOT
    working — stop and investigate before continuing.

Also verify grounding (should NOT invent numbers):

    curl -s -N -X POST "https://$DOMAIN/api/chat" \
      -H 'Content-Type: application/json' \
      -d '{"mode":"assistant","messages":[{"role":"user","content":"how many families still need a code"}]}'

PASS: it answers from the Hub's own data (111 real families, 7 coded, 104 without)
and says "Sources: Your Hub's own data" — and it must NOT cite an unrelated
web page for this question.

================================================================================
6. REBUILD AND REPUBLISH THE HUB AGAINST THE REAL API
================================================================================

    cd ~/beyond-limits-hub
    rm -rf dist
    VITE_ANDY_MOCK=0 VITE_ANDY_API="https://$DOMAIN" \
      npx vite build --base=/beyond-limits-hub/

    cd dist
    git init -q
    git add -A
    git -c user.email=agent@zilla -c user.name=Zilla commit -qm "deploy: live AI"
    git push -f https://github.com/VastlyResilient/beyond-limits-hub.git HEAD:gh-pages

VERIFIED: the hub repo has branches `main` and `gh-pages`, and GitHub Pages
serves the site from `gh-pages`. Pushing to gh-pages IS correct.
A forced push is intended — the gh-pages branch is a build artifact.

Allow ~60 seconds for Pages to rebuild, then hard-refresh (Cmd+Shift+R).

================================================================================
7. VERIFY THE LIVE HUB
================================================================================

1. Open https://vastlyresilient.github.io/beyond-limits-hub/
2. The YELLOW "demo mode" banner must be GONE.
3. Click "Ask Andy" (bottom right).
4. Ask: "What is the latest news about Stamford Connecticut today?"
   PASS: a fresh answer with real sources — NOT a repeated canned sentence.
5. Ask the same question twice. PASS: two DIFFERENT answers. The old symptom was
   identical repetitive wording because it was the mock's fixed strings.
6. Ask: "how many families still need a code"
   PASS: answers 104 from Hub data, no irrelevant web citation.
7. Ask something the Hub cannot know, e.g. "what is our tax filing number"
   PASS: it says it does not have that in the system. It must NOT invent one.

Confirm no console errors and the request goes to your Railway domain
(DevTools > Network > /api/chat).

================================================================================
8. PITFALLS (read these — each one costs real time)
================================================================================

PITFALL 1 — Railway OAuth login was broken; it is now FIXED. Do not "fix" it again.
  Root cause: Railway's OAuth metadata publishes
    authorization_endpoint = "https://backboard.railway.com/oauth/auth?resource=..."
  which ALREADY contains a query string. The MCP SDK appended a bare "?" so the
  URL had two "?" — folding response_type into the resource value, and Railway
  rejected every attempt with `invalid_request`.
  Fix applied at:
    ~/.zilla/hermes-agent/venv/lib/python3.12/site-packages/mcp/client/auth/oauth2.py
  (backup: oauth2.py.bak-preqsep). It now picks "?" or "&" based on whether the
  endpoint already has a query. Verified: login now succeeds with 52 tools.
  This is a patch to an installed package — it survives until the MCP SDK is
  upgraded, at which point the upstream fix (or this patch) must be reapplied.

PITFALL 2 — andy-api/deploy.sh has a path bug. It does
    cd "$(dirname "$0")/andy-api"
  but deploy.sh already lives INSIDE andy-api, so that resolves to
  andy-api/andy-api and fails. Do not run it as-is. Either fix the cd to
  `cd "$(dirname "$0")"`, or just follow the manual steps above.

PITFALL 3 — Do not deploy from GitHub. `VastlyResilient/andy-api` may be stale
  (last pushed 2026-09-18) and lacks the newest web-browsing work. And because
  `andy-api/` sits inside the hub repo, deploying from the hub repo would require
  setting the Railway service root directory to `andy-api`. `railway up` from the
  local directory avoids both problems.

PITFALL 4 — Mock vs real is a BUILD-TIME flag. VITE_ANDY_MOCK is baked in by Vite.
  Setting it at runtime does nothing. You must rebuild (step 6). If the demo
  banner is still visible, the rebuild did not pick up VITE_ANDY_MOCK=0.

PITFALL 5 — CORS. The API locks origins to ALLOWED_ORIGINS. The browser origin is
  exactly `https://vastlyresilient.github.io` (no trailing slash, no path).
  A mismatch shows up as a CORS error in the console while curl still works.

PITFALL 6 — Spend cap. MONTHLY_CAP_USD=10 is enforced in-app (HTTP 402 past cap).
  Separately, the OpenRouter KEY itself has no key-level limit set; that can only
  be set in the OpenRouter dashboard. In-app enforcement is what is live.

PITFALL 7 — Secrets. The OpenRouter key lives ONLY in andy-api/.env, which is
  gitignored. Never echo it, never commit it, never put it in the built bundle.
  After building, sanity-check the bundle does not contain "sk-or-":
    grep -rl "sk-or-" dist/ && echo "LEAK" || echo "clean"

================================================================================
9. DEFINITION OF DONE
================================================================================

[ ] `railway whoami` prints bobbyatf@gmail.com
[ ] `curl https://$DOMAIN/health` returns 200 JSON
[ ] /api/chat returns a live answer WITH real web sources for the Stamford question
[ ] /api/chat answers the "families needing a code" question from Hub data (104)
[ ] Hub rebuilt with VITE_ANDY_MOCK=0 and pushed to gh-pages
[ ] Live site: demo banner gone
[ ] Live site: same question asked twice gives two different answers
[ ] Live site: unanswerable question is refused, not invented
[ ] No console errors; no "sk-or-" string in dist/
