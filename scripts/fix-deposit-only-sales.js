// One-time repair for sales that were saved with the money only in the deposit
// field (amount left empty). Until resolveSaleAmounts() existed, such a sale
// counted as zero in every revenue figure and reached finance as a 0.00 invoice.
//
//   1. Approved sale records with a deposit but no amount get amount = deposit,
//      so CRM revenue and monthly targets count them.
//   2. A 0.00 finance invoice that such a sale produced is voided the way the
//      finance screen's Del button does, and a correct invoice is issued in its
//      place (new invoice number, journal entry, commission).
//      Sales whose zero invoice was already replaced by hand are left alone.
//
// Dry run (default — reads only):  node scripts/fix-deposit-only-sales.js
// Apply:                           node scripts/fix-deposit-only-sales.js --apply
//
// Prints ids, invoice numbers and amounts only.

import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

// finance-db reads DATABASE_URL when it loads, so it has to come after dotenv
const { neon } = await import('@neondatabase/serverless')
const { softDeleteSale } = await import('../lib/finance-db.js')
const { recordSaleInFinance } = await import('../lib/sale-finance.js')

const sql = neon(process.env.DATABASE_URL || process.env.POSTGRES_URL)
const apply = process.argv.includes('--apply')
const ACTOR = 'crm-repair'

const missingAmount = await sql`
  SELECT id, employee_id, deposit, sale_status FROM sale_records
  WHERE approval_status = 'approved' AND amount_paid IS NULL AND deposit > 0
  ORDER BY id
`
console.log(`Sale records with a deposit but no amount: ${missingAmount.length}`)
for (const r of missingAmount) console.log(`  sale #${r.id} (employee ${r.employee_id}): amount -> ${r.deposit}`)

// A zero invoice belongs to a sale when it came from the CRM for the same
// customer phone and day, and that sale does stand for some money.
const zeroInvoices = await sql`
  SELECT f.id AS fin_id, f.invoice_number, sr.id AS sale_id, COALESCE(sr.amount_paid, sr.deposit) AS amount
  FROM fin_sales f
  JOIN sale_records sr ON sr.student_phone_normalized = f.customer_phone
    AND sr.sale_date = f.sale_date AND sr.employee_id = f.employee_id
  WHERE f.source = 'crm' AND NOT f.is_deleted AND f.total = 0
    AND sr.approval_status = 'approved' AND sr.sale_status <> 'cancelled'
    AND COALESCE(sr.amount_paid, sr.deposit) > 0
  ORDER BY f.id
`
console.log(`Zero-amount finance invoices to replace: ${zeroInvoices.length}`)
for (const z of zeroInvoices) console.log(`  ${z.invoice_number} (sale #${z.sale_id}): void, then issue a new invoice for ${z.amount}`)

if (!apply) {
  console.log('\nDry run — nothing changed. Re-run with --apply to make these changes.')
  process.exit(0)
}

const fixed = await sql`
  UPDATE sale_records SET amount_paid = deposit
  WHERE approval_status = 'approved' AND amount_paid IS NULL AND deposit > 0
  RETURNING id
`
console.log(`\nAmount filled in on ${fixed.length} sale record(s).`)

for (const z of zeroInvoices) {
  const [sale] = await sql`SELECT * FROM sale_records WHERE id = ${z.sale_id}`
  await softDeleteSale(z.fin_id, ACTOR)
  try {
    const invoice = await recordSaleInFinance(sale, ACTOR)
    console.log(`${z.invoice_number} voided -> ${invoice.invoice_number} issued: total ${invoice.total}, ${invoice.payment_status}`)
  } catch (err) {
    console.error(`${z.invoice_number} was voided but its replacement could not be issued — add sale #${z.sale_id} (${z.amount}) in finance by hand.`)
    throw err
  }
}
console.log('Done.')
