import "dotenv/config";
import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import { Client } from "pg";
import {
  E2E_ADMIN_USERNAME,
  E2E_ADMIN_PASSWORD,
  E2E_SALES_USERNAME,
  E2E_SALES_PASSWORD,
} from "./test-users";

// Talks to Postgres directly via `pg` rather than the generated Prisma
// client — that client emits `import.meta` which only resolves under a
// real ESM loader (works fine under `tsx`, e.g. prisma/seed.ts, but not
// under Playwright's own CJS-ish config transform).
async function upsertUser(
  client: Client,
  args: { username: string; password: string; fullName: string; role: "ADMIN" | "SALES_EMPLOYEE" }
) {
  const passwordHash = await bcrypt.hash(args.password, 10);
  await client.query(
    `INSERT INTO users (id, username, password_hash, full_name, role, is_active, updated_at)
     VALUES ($1, $2, $3, $4, $5, true, NOW())
     ON CONFLICT (username) DO UPDATE SET
       password_hash = EXCLUDED.password_hash,
       is_active = true,
       totp_enabled = false,
       totp_secret = NULL,
       totp_backup_codes = ARRAY[]::TEXT[],
       updated_at = NOW()`,
    [randomUUID(), args.username, passwordHash, args.fullName, args.role]
  );
}

export default async function globalSetup() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    await upsertUser(client, {
      username: E2E_ADMIN_USERNAME,
      password: E2E_ADMIN_PASSWORD,
      fullName: "E2E Smoke Test Admin",
      role: "ADMIN",
    });
    await upsertUser(client, {
      username: E2E_SALES_USERNAME,
      password: E2E_SALES_PASSWORD,
      fullName: "E2E Smoke Test Sales Employee",
      role: "SALES_EMPLOYEE",
    });
  } finally {
    await client.end();
  }
}
