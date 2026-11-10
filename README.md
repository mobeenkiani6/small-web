# Small Web

A full-stack technical assessment: a **small web** of one-page sites in MongoDB, and a **browser** (Next.js) to read them — address bar, links, back/forward with restore, history, search, and publish.

**Stack:** Next.js · NestJS · MongoDB · TypeScript

## Run

```bash
# 1) MongoDB (Docker)
docker compose up -d

# 2) Install
npm install

# 3) Seed (idempotent — safe to re-run)
npm run seed

# 4) API  → http://localhost:4000
npm run dev:api

# 5) Web  → http://localhost:3000
npm run dev:web
```

Optional env: `MONGODB_URI` · `NEXT_PUBLIC_API_URL` · `PORT`

## What it does

| Capability | Behavior |
|---|---|
| Browse | Type an address or follow in-page links (including broken ones) |
| Back / Forward | Session stack; forward is discarded after a new branch |
| Restore | Stack stores the HTML snapshot shown — back restores that page |
| History | Per person, scrollable, jumpable |
| Search | Full-text over page body/title/address |
| Publish | Address + HTML; sanitized (`sanitize-html`) before store/render |
| Authors | Pick a person from the list, or add a new author |

Identity is a name from the people list (no accounts). History belongs to that name.

## Seed

`npm run seed` loads 10 interlinked sites (`tidepool.zz`, `lighthouse.zz`, …), 5 people (3 authors with multiple sites), and a deterministic hour of visits including missing addresses. Running seed again replaces data — it does not double the web.

## Containment

Untrusted published HTML is sanitized server-side in `apps/api/src/sanitize.ts` (scripts, handlers, iframes stripped). Authors keep structural markup and in-web `href` links.
