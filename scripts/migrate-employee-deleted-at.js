// Adds employees.deleted_at — set when an employee with sales/finance history is
// removed from the admin panel (the row is archived instead of deleted so
// finance stays correct). Idempotent. Run: node scripts/migrate-employee-deleted-at.js
require('dotenv').config({ path: '.env.local' })
const { neon } = require('@neondatabase/serverless')
const sql = neon(process.env.DATABASE_URL || process.env.POSTGRES_URL)
sql`ALTER TABLE employees ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ`
  .then(() => console.log('✅ employees.deleted_at ready'))
  .catch(err => { console.error('❌', err.message); process.exit(1) })
