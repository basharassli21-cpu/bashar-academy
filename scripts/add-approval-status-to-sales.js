import 'dotenv/config'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL || process.env.POSTGRES_URL)

// Add column — existing records keep 'approved' (they already have student accounts)
await sql`ALTER TABLE sale_records ADD COLUMN IF NOT EXISTS approval_status VARCHAR(20) NOT NULL DEFAULT 'approved'`

console.log('Done: approval_status column added to sale_records (existing rows = approved)')
