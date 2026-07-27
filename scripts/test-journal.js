// scripts/test-journal.js — Verify double-entry balance across all journal entries
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL || process.env.POSTGRES_URL)

let pass = 0, fail = 0

function ok(label)  { console.log(`  ✓ ${label}`); pass++ }
function err(label) { console.error(`  ✗ ${label}`); fail++ }

async function run() {
  console.log('\n📒 Journal Balance Verification\n')

  // 1. Every entry with lines must have SUM(debit) = SUM(credit)
  const unbalanced = await sql`
    SELECT je.id, je.entry_number,
           SUM(jl.debit)::numeric  AS total_dr,
           SUM(jl.credit)::numeric AS total_cr,
           ABS(SUM(jl.debit) - SUM(jl.credit))::numeric AS diff
    FROM fin_journal_entries je
    JOIN fin_journal_lines jl ON jl.entry_id = je.id
    WHERE NOT je.is_deleted
    GROUP BY je.id, je.entry_number
    HAVING ABS(SUM(jl.debit) - SUM(jl.credit)) > 0.005
    ORDER BY je.id
  `
  if (unbalanced.length === 0) {
    ok('All journal entries are balanced (DR = CR)')
  } else {
    unbalanced.forEach(r => err(`Entry ${r.entry_number} unbalanced: DR=${r.total_dr} CR=${r.total_cr} diff=${r.diff}`))
  }

  // 2. No orphan journal lines (lines without a parent entry)
  const [{ orphans }] = await sql`
    SELECT COUNT(*)::int AS orphans FROM fin_journal_lines jl
    WHERE NOT EXISTS (SELECT 1 FROM fin_journal_entries je WHERE je.id = jl.entry_id)
  `
  orphans === 0 ? ok('No orphan journal lines') : err(`${orphans} orphan journal lines found`)

  // 3. Account balances sanity check — asset + expense balances should be >= 0
  const negAssets = await sql`
    SELECT code, name, balance FROM fin_accounts
    WHERE type IN ('asset') AND balance < -0.01 AND NOT is_deleted
  `
  negAssets.length === 0 ? ok('No negative asset balances') : negAssets.forEach(a => err(`Asset ${a.code} ${a.name}: balance=${a.balance}`))

  // 4. Count posted entries
  const [stats] = await sql`
    SELECT
      COUNT(DISTINCT je.id)::int   AS entry_count,
      COUNT(jl.id)::int            AS line_count,
      COALESCE(SUM(jl.debit),0)::numeric  AS total_dr,
      COALESCE(SUM(jl.credit),0)::numeric AS total_cr
    FROM fin_journal_entries je
    LEFT JOIN fin_journal_lines jl ON jl.entry_id = je.id
    WHERE NOT je.is_deleted
  `
  console.log(`\n  📊 Stats: ${stats.entry_count} entries, ${stats.line_count} lines`)
  console.log(`     Total DR: ${parseFloat(stats.total_dr).toFixed(2)}`)
  console.log(`     Total CR: ${parseFloat(stats.total_cr).toFixed(2)}`)

  // 5. Check accounts exist
  const requiredCodes = ['1000','1010','1020','1030','1040','1100','2010','2020','2030',
    '3020','3030','4000','4010','4020','4040','5000','5010','5020','5030','5040',
    '5050','5060','5070','5080','5090','5100','5110','5120','5130','5140','5150','5160']
  const existing = await sql`SELECT code FROM fin_accounts WHERE code = ANY(${requiredCodes})`
  const found = new Set(existing.map(r => r.code))
  const missing = requiredCodes.filter(c => !found.has(c))
  missing.length === 0 ? ok(`All ${requiredCodes.length} required accounts exist`) : err(`Missing accounts: ${missing.join(', ')}`)

  // 6. Idempotency index exists
  const [idxRow] = await sql`
    SELECT 1 FROM pg_indexes WHERE tablename = 'fin_journal_entries' AND indexname = 'idx_journal_idempotency'
  `
  idxRow ? ok('Idempotency index exists on fin_journal_entries') : err('Idempotency index MISSING')

  // 7. sales.amount_paid column exists
  const [amtPaidCol] = await sql`
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'fin_sales' AND column_name = 'amount_paid'
  `
  amtPaidCol ? ok('fin_sales.amount_paid column exists') : err('fin_sales.amount_paid column MISSING')

  // 8. gateway_fee column exists
  const [gwFeeCol] = await sql`
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'fin_sales' AND column_name = 'gateway_fee'
  `
  gwFeeCol ? ok('fin_sales.gateway_fee column exists') : err('fin_sales.gateway_fee column MISSING')

  // 9. Sales without journal entries (only for paid sales)
  const [noJournal] = await sql`
    SELECT COUNT(*)::int AS n FROM fin_sales
    WHERE NOT is_deleted AND payment_status = 'paid' AND journal_entry_id IS NULL
  `
  noJournal.n === 0 ? ok('All paid sales have journal entries') : err(`${noJournal.n} paid sales have NO journal entry (run migration or re-save)`)

  // Summary
  console.log(`\n${'─'.repeat(50)}`)
  if (fail === 0) {
    console.log(`\n✅ All ${pass} checks passed\n`)
  } else {
    console.log(`\n❌ ${fail} failed, ${pass} passed\n`)
    process.exit(1)
  }
}

run().catch(e => { console.error('❌ Test error:', e.message); process.exit(1) })
