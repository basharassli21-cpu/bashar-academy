This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Testing

End-to-end smoke tests (login, route guards, and the full create → update →
delete lead lifecycle) run with [Playwright](https://playwright.dev):

```bash
npm run test:e2e        # headless
npm run test:e2e:ui     # interactive UI mode
```

This starts its own `next dev` server on port 3100 and creates/removes two
dedicated `e2e-*-smoke-test` accounts (see `e2e/global-setup.ts` and
`e2e/global-teardown.ts`) — it does not touch any other data. Requires
`DATABASE_URL` and `JWT_SECRET` to already be set (e.g. via `.env`).

`.github/workflows/ci.yml` runs lint, type checking, the production build,
and this E2E suite on every push/PR against an ephemeral Postgres service
container — it never touches the real database. This only runs once the
repo is pushed to GitHub.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
