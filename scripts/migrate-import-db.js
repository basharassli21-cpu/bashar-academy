// One-time (idempotent) schema setup for Import Leads.
// Run with: node scripts/migrate-import-db.js
// Requires DATABASE_URL (or POSTGRES_URL) in the environment — loads .env.local automatically.

require('dotenv').config({ path: '.env.local' })
const { neon } = require('@neondatabase/serverless')

const sql = neon(process.env.DATABASE_URL || process.env.POSTGRES_URL)

async function migrate() {
  await sql`
    CREATE TABLE IF NOT EXISTS lead_imports (
      id SERIAL PRIMARY KEY,
      filename VARCHAR(255) NOT NULL,
      uploaded_by VARCHAR(100) NOT NULL,
      total_rows INTEGER NOT NULL,
      imported_count INTEGER NOT NULL,
      updated_count INTEGER NOT NULL,
      skipped_count INTEGER NOT NULL,
      invalid_count INTEGER NOT NULL,
      assignment_mode VARCHAR(20) NOT NULL,
      assigned_employee_id INTEGER REFERENCES employees(id) ON DELETE SET NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `
  await sql`CREATE INDEX IF NOT EXISTS idx_lead_imports_created ON lead_imports(created_at)`

  console.log('Import Leads schema ready: lead_imports')
}

migrate().catch(err => { console.error(err); process.exit(1) })
