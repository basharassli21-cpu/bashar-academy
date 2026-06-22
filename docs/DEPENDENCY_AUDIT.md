# Dependency audit

Snapshot from a full `npm audit` pass, what was fixed, and why everything
left is an accepted risk rather than an oversight. Re-run `npm audit`
periodically — this file describes the state as of this review, not a
guarantee that stays true forever.

## Fixed: xlsx (high severity, 2 CVEs)

The lead-import feature used `xlsx` (SheetJS) client-side to parse
uploaded `.xlsx` files in the browser. The npm-registry build of `xlsx`
(`0.18.5`) carries two known high-severity issues with no registry fix:

- **CVE-2023-30533** — prototype pollution, fixed upstream in `0.19.3`.
- **CVE-2024-22363** — ReDoS, fixed upstream in `0.20.2`.

SheetJS only publishes those patched versions to their own CDN
(`cdn.sheetjs.com`), never to the public npm registry — so
`npm audit fix` reports `fixAvailable: false` and a registry-only install
can never outrun these CVEs. Installing directly from a third-party CDN
tarball was considered and rejected (supply-chain risk of an
unaudited, non-registry source).

**Fix**: replaced `xlsx` with `exceljs` (actively maintained, normal npm
releases). `exceljs` isn't reliably bundleable for the browser, so the
parsing step moved server-side as part of the migration:

- `src/lib/leads/import-parser.ts` — the actual CSV/XLSX parsing
  (previously inline in the client component).
- `POST /api/admin/leads/import/parse` — new route the client now
  uploads the raw file to; returns parsed `ImportRow[]` JSON.
- `src/components/admin/leads/lead-import-page-client.tsx` — no longer
  imports any parsing library; just uploads the file and renders the
  result.

Net effect: zero parsing-library code ships to the client bundle anymore,
and the parsing dependency runs only in a trusted server context.

## Accepted: remaining moderate findings

Everything below is `severity: moderate`, and in every case the
vulnerable code path is either dev-tooling that never reaches production,
or unreachable given how this app actually calls the package.

| Package | Pulled in by | Advisory | Why it's accepted |
|---|---|---|---|
| `@hono/node-server` | `prisma` → `@prisma/dev`, and the `shadcn` CLI | [GHSA-92pp-h63x-v22m](https://github.com/advisories/GHSA-92pp-h63x-v22m) (static-file middleware bypass) | Only used by Prisma's local dev CLI tooling and the one-shot `shadcn add` scaffolding CLI. Neither ships in the deployed app — this app talks to Neon Postgres directly via `DATABASE_URL`, never `prisma dev`'s embedded DB server. |
| `@prisma/dev` | `prisma` | (inherits the `@hono/node-server` advisory) | Same — local dev CLI only. |
| `prisma` (CLI package) | direct devDependency | (flagged solely for depending on `@prisma/dev`) | Not the `@prisma/client` runtime import the app actually uses at request time; this is the CLI package used for `migrate`/`generate`. `fixAvailable` suggests downgrading to `6.19.3`, which would lose Prisma 7 features in use — the real fix is an upstream patch to `@hono/node-server`, not a downgrade. |
| `next` | direct dependency | (flagged solely for its internal `postcss`) | Internal build-time PostCSS usage, not user-reachable. |
| `postcss` | `next`, `@tailwindcss/postcss` | [GHSA-qx2v-qp2m-jg93](https://github.com/advisories/GHSA-qx2v-qp2m-jg93) (XSS via unescaped `</style>` in stringified output) | Build-time only — processes this repo's own authored Tailwind/CSS source, never user-supplied input. No path for an attacker to get arbitrary CSS into the build. |
| `exceljs` | direct dependency (this migration) | (flagged solely for depending on `uuid`) | See `uuid` below. |
| `uuid` | `exceljs` | [GHSA-w5hq-g745-h8pq](https://github.com/advisories/GHSA-w5hq-g745-h8pq) (missing buffer bounds check in `v3`/`v5`/`v6` when a buffer is supplied) | Verified via `npm view exceljs dependencies.uuid` and grepping `node_modules/exceljs/lib` — exceljs only ever calls `uuid`'s `v4()`, and only inside conditional-formatting code this app's read-only `workbook.xlsx.load()` import path never executes. |

None of these are reachable from a request an external user can send to
this app. If `npm audit` is re-run later and any of these gain a
registry-published fix with no major-version jump, take it — there's no
reason to keep carrying them once a real fix exists.
