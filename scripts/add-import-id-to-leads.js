import 'dotenv/config'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL || process.env.POSTGRES_URL)

await sql`ALTER TABLE leads ADD COLUMN IF NOT EXISTS import_id INTEGER`
await sql`CREATE INDEX IF NOT EXISTS idx_leads_import_id ON leads(import_id) WHERE import_id IS NOT NULL`
console.log('Done: import_id column added to leads')
