# Profile Likes

The GitHub Pages frontend calls `https://academic-profile-likes.jingsongwang0616.workers.dev/likes`.
The independent Cloudflare Worker uses the D1 database `academic-profile-likes`, bound as `DB`.
Initialize a new database with `schema.sql`, then deploy `index.js` as an ES-module Worker.
No API key belongs in the frontend. Deployments were made through the Cloudflare dashboard.

The API only allows the production homepage origin. GET returns `{count, liked}`;
PUT accepts `{liked: boolean}` with a random UUID v4 in `X-Visitor-Id`.
The browser stores only that anonymous ID. The database stores its SHA-256 hash
and the time of each active like. Unliking removes that record. It does not count visits.
Updates are idempotent. Twenty updates per IP/minute are allowed; only a minute-scoped
IP hash is stored for rate limiting. Expired rate rows are cleaned on subsequent writes.
Cloudflare necessarily receives request IPs. This is not authenticated one-person-one-vote:
clearing browser storage, other browsers, and determined automation can add votes.

Run `node --test tests/likes.test.mjs` with Node 24 from the source root.
Tests use SQLite in memory and do not alter production counts.
Keep Workers on the Free plan; no paid subscription is required or authorized.
