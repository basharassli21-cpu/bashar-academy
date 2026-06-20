// One-time (idempotent) schema setup for the Sales Management System.
// Run with: node scripts/migrate-sales-db.js
// Requires DATABASE_URL (or POSTGRES_URL) in the environment — loads .env.local automatically.

require('dotenv').config({ path: '.env.local' })
const { neon } = require('@neondatabase/serverless')

const sql = neon(process.env.DATABASE_URL || process.env.POSTGRES_URL)

async function migrate() {
  await sql`
    CREATE TABLE IF NOT EXISTS employees (
      id SERIAL PRIMARY KEY,
      username VARCHAR(50) UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name VARCHAR(100) NOT NULL,
      monthly_target INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS leads (
      id SERIAL PRIMARY KEY,
      employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
      sequence INTEGER NOT NULL,
      customer_name VARCHAR(100) NOT NULL,
      phone VARCHAR(30) NOT NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'new',
      last_contact_date DATE,
      next_followup_date DATE,
      closed_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      UNIQUE(employee_id, sequence)
    )
  `
  await sql`CREATE INDEX IF NOT EXISTS idx_leads_employee ON leads(employee_id)`

  await sql`
    CREATE TABLE IF NOT EXISTS lead_notes (
      id SERIAL PRIMARY KEY,
      lead_id INTEGER NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
      text TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `
  await sql`CREATE INDEX IF NOT EXISTS idx_notes_lead ON lead_notes(lead_id)`

  await sql`
    CREATE TABLE IF NOT EXISTS call_logs (
      id SERIAL PRIMARY KEY,
      employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
      lead_id INTEGER NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `
  await sql`CREATE INDEX IF NOT EXISTS idx_calls_employee_date ON call_logs(employee_id, created_at)`

  console.log('Sales DB schema ready: employees, leads, lead_notes, call_logs')
}

migrate().catch(err => { console.error(err); process.exit(1) })
