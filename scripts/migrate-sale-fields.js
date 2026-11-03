// scripts/migrate-sale-fields.js
// Adds financial + status fields to sale_records to match CRM feature parity.
// Run: node scripts/migrate-sale-fields.js

import { neon } from '@neondatabase/serverless'
import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const envPath = join(__dirname, '..', '.env.local')
const env = {}
for (const line of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
  const m = line.match(/^([^#=\s][^=]*)=(.*)/)
  if (m) env[m[1].trim()] = m[2].trim()
}

const sql = neon(env.DATABASE_URL || env.POSTGRES_URL)

async function run() {
  console.log('🔄 Migrating sale_records financial fields...\n')

  await sql`ALTER TABLE sale_records ADD COLUMN IF NOT EXISTS amount_paid DECIMAL(10,2)`
  console.log('✅ sale_records.amount_paid')

  await sql`ALTER TABLE sale_records ADD COLUMN IF NOT EXISTS deposit DECIMAL(10,2)`
  console.log('✅ sale_records.deposit')

  await sql`ALTER TABLE sale_records ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'bank_transfer'`
  console.log('✅ sale_records.payment_method')

  await sql`ALTER TABLE sale_records ADD COLUMN IF NOT EXISTS sale_status TEXT DEFAULT 'paid' CHECK (sale_status IN ('paid','pending','cancelled'))`
  console.log('✅ sale_records.sale_status')

  // Add status_at_time to lead_notes for activity timeline
  await sql`ALTER TABLE lead_notes ADD COLUMN IF NOT EXISTS status_at_time TEXT`
  console.log('✅ lead_notes.status_at_time')

  // Index for revenue queries
  await sql`CREATE INDEX IF NOT EXISTS sale_records_employee_status ON sale_records(employee_id, sale_status)`
  console.log('✅ sale_records index (employee_id, sale_status)')

  console.log('\n🎉 Migration complete.')
  process.exit(0)
}

run().catch(e => { console.error('❌', e.message); process.exit(1) })
