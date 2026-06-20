// One-time (idempotent) schema setup for OpenC (Open Calls Pool).
// Run with: node scripts/migrate-openc-db.js
// Requires DATABASE_URL (or POSTGRES_URL) in the environment — loads .env.local automatically.

require('dotenv').config({ path: '.env.local' })
const { neon } = require('@neondatabase/serverless')

const sql = neon(process.env.DATABASE_URL || process.env.POSTGRES_URL)

async function migrate() {
  await sql`
    CREATE TABLE IF NOT EXISTS openc_leads (
      id SERIAL PRIMARY KEY,
      customer_name VARCHAR(100) NOT NULL,
      phone VARCHAR(30) NOT NULL,
      last_status VARCHAR(20),
      reason TEXT,
      last_contact_date DATE,
      source_lead_id INTEGER REFERENCES leads(id) ON DELETE SET NULL,
      returned_by_employee_id INTEGER REFERENCES employees(id) ON DELETE SET NULL,
      returned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      status VARCHAR(20) NOT NULL DEFAULT 'open',
      claimed_by_employee_id INTEGER REFERENCES employees(id) ON DELETE SET NULL,
      claimed_at TIMESTAMPTZ,
      claimed_lead_id INTEGER REFERENCES leads(id) ON DELETE SET NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `
  await sql`CREATE INDEX IF NOT EXISTS idx_openc_status ON openc_leads(status)`

  await sql`
    CREATE TABLE IF NOT EXISTS openc_transfer_logs (
      id SERIAL PRIMARY KEY,
      openc_lead_id INTEGER NOT NULL REFERENCES openc_leads(id) ON DELETE CASCADE,
      action VARCHAR(20) NOT NULL,
      actor_employee_id INTEGER REFERENCES employees(id) ON DELETE SET NULL,
      actor_role VARCHAR(20) NOT NULL,
      details TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `

  await sql`ALTER TABLE leads ADD COLUMN IF NOT EXISTS claimed_from_openc_id INTEGER REFERENCES openc_leads(id) ON DELETE SET NULL`

  console.log('OpenC schema ready: openc_leads, openc_transfer_logs, leads.claimed_from_openc_id')
}

migrate().catch(err => { console.error(err); process.exit(1) })
