import "dotenv/config";
import { Client } from "pg";
import { E2E_ADMIN_USERNAME, E2E_SALES_USERNAME } from "./test-users";

async function removeTestUser(client: Client, username: string) {
  const { rows } = await client.query<{ id: string }>(`SELECT id FROM users WHERE username = $1`, [
    username,
  ]);
  const user = rows[0];
  if (!user) return;

  // Audit logs are intentionally left alone — actor_user_id is nullable
  // and ON DELETE SET NULL, preserving history the same way it would for
  // any other deleted account.
  await client.query(`UPDATE leads SET owner_employee_id = NULL WHERE owner_employee_id = $1`, [
    user.id,
  ]);
  await client.query(`DELETE FROM lead_notes WHERE employee_id = $1`, [user.id]);
  await client.query(`DELETE FROM leads WHERE created_by = $1`, [user.id]);
  await client.query(`DELETE FROM users WHERE id = $1`, [user.id]);
}

export default async function globalTeardown() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    await removeTestUser(client, E2E_ADMIN_USERNAME);
    await removeTestUser(client, E2E_SALES_USERNAME);
  } finally {
    await client.end();
  }
}
