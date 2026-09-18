# andy-api

The small service that holds the OpenRouter key for Andy's AI. The Hub is a
static site, so the key can never live in the browser — it lives here.

## What it does

| Endpoint | Purpose |
|---|---|
| `GET /health` | liveness, used by Railway |
| `POST /api/chat` | streams a reply from `deepseek/deepseek-v4.1-flash`; in Builder mode it also validates the model's proposed edit against the registry the client sent |
| `POST /api/fetch` | reads a public web page for the Assistant, with SSRF guards |
| `GET /api/memory` | the running conversation memory (compacted past 24 turns) |
| `POST /api/memory/clear` | forget everything |

## Safety properties

- **The Builder cannot write code.** It returns a JSON envelope naming a target
  from a closed registry; `editOps.js` rejects anything else, including unknown
  operation kinds and targets outside the registry.
- **The web scraper cannot be aimed inward.** `webdoc.js` refuses non-http(s)
  schemes and private, loopback and link-local hosts.
- **Spend is capped twice.** `MONTHLY_CAP_USD` is enforced here (HTTP 402 when
  exhausted) *and* you should set a credit limit on the OpenRouter key itself.

## Run locally

```bash
cp .env.example .env      # fill in OPENROUTER_API_KEY
npm install
npm start                 # listens on :8080
npm test                  # 27 tests
```

Then point the Hub at it:

```bash
cd .. && VITE_ANDY_API=http://localhost:8080 npm run dev
```

## Deploy

```bash
railway init
railway variables set \
  OPENROUTER_API_KEY=sk-or-v1-... \
  ALLOWED_ORIGINS=https://vastlyresilient.github.io,http://localhost:5173 \
  MONTHLY_CAP_USD=10
railway up
railway domain
```

Then rebuild the Hub **without** demo mode so it talks to the real service:

```bash
cd ..
rm -rf dist && VITE_ANDY_MOCK=0 npx vite build --base=/beyond-limits-hub/
```

## Funding the $10

1. In OpenRouter, create a key named `beyond-limits-andy`.
2. Set its **credit limit to $10** on the key, not just the account.
3. Put that key in `OPENROUTER_API_KEY`.

The service also refuses to spend past `MONTHLY_CAP_USD` and reports the
remaining balance in its final stream frame.
