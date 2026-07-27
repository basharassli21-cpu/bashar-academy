import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL || process.env.POSTGRES_URL)

async function migrateV2() {
  console.log('🏦 Finance System v2 — Schema migration...')

  // ── 1. New Chart of Accounts ────────────────────────────────────────────
  const newAccounts = [
    { code:'3020', name:'Partner Current Account',      name_ar:'حساب جاري الشريك',            type:'equity',   category:'Partner Accounts' },
    { code:'3030', name:'Partner Capital',              name_ar:'رأس المال',                    type:'equity',   category:'Equity'           },
    { code:'4040', name:'Sales Returns & Allowances',   name_ar:'مردودات ومسموحات المبيعات',   type:'revenue',  category:'Contra Revenue'   },
    { code:'5130', name:'Payment Gateway Fees',         name_ar:'عمولات بوابات الدفع',          type:'expense',  category:'Financial'        },
    { code:'5140', name:'Monthly Subscriptions',        name_ar:'اشتراكات شهرية',               type:'expense',  category:'Technology'       },
    { code:'5150', name:'Phone & Communications',       name_ar:'هاتف واتصالات',                type:'expense',  category:'Operations'       },
    { code:'5160', name:'Meta Ads',                     name_ar:'إعلانات ميتا',                 type:'expense',  category:'Marketing'        },
  ]
  for (const a of newAccounts) {
    await sql`
      INSERT INTO fin_accounts (code, name, name_ar, type, category)
      VALUES (${a.code}, ${a.name}, ${a.name_ar}, ${a.type}, ${a.category})
      ON CONFLICT (code) DO NOTHING
    `
    console.log(`  ✓ ${a.code}  ${a.name_ar}`)
  }

  // ── 2. journal_entries — add reversal & idempotency columns ─────────────
  await sql`ALTER TABLE fin_journal_entries ADD COLUMN IF NOT EXISTS source_ref     VARCHAR(200)`
  await sql`ALTER TABLE fin_journal_entries ADD COLUMN IF NOT EXISTS reversal_of_id INTEGER REFERENCES fin_journal_entries(id)`
  console.log('✓ fin_journal_entries: source_ref, reversal_of_id')

  // Unique index — prevents duplicate journal entries for the same source event
  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_journal_idempotency
    ON fin_journal_entries(source_type, source_id)
    WHERE source_id IS NOT NULL AND NOT is_deleted
  `
  console.log('✓ idempotency index on fin_journal_entries')

  // ── 3. fin_sales — gateway fee + partial payment tracking ───────────────
  await sql`ALTER TABLE fin_sales ADD COLUMN IF NOT EXISTS gateway_fee     NUMERIC(15,2) DEFAULT 0`
  await sql`ALTER TABLE fin_sales ADD COLUMN IF NOT EXISTS gateway_fee_pct NUMERIC(5,4)  DEFAULT 0`
  await sql`ALTER TABLE fin_sales ADD COLUMN IF NOT EXISTS amount_paid     NUMERIC(15,2) DEFAULT 0`
  // backfill amount_paid
  await sql`UPDATE fin_sales SET amount_paid = total WHERE payment_status = 'paid' AND NOT is_deleted AND amount_paid = 0`
  console.log('✓ fin_sales: gateway_fee, gateway_fee_pct, amount_paid')

  // ── 4. fin_journal_entries — move source_id from sale FK to bare integer ─
  // (already INTEGER, just needs the source_id populated for existing entries)
  // We'll leave existing NULL source_id entries as-is — they predate v2
  console.log('✅ Finance v2 migration complete!')
  console.log('')
  console.log('Now run:  node --env-file=.env.local scripts/test-journal.js')
}

migrateV2().catch(e => { console.error('❌', e.message); process.exit(1) })
