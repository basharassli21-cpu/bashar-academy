// lib/finance-db.js — Finance & Accounting System (v2 — Full Double-Entry IFRS)
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL || process.env.POSTGRES_URL)

// ─── Account Maps ─────────────────────────────────────────────────────────
// Maps payment_method → account code (debit on receive, credit on pay)
const PAYMENT_ACCOUNT = {
  stripe:   '1020',
  paypal:   '1030',
  bank:     '1010',
  transfer: '1010',
  cash:     '1000',
  crypto:   '1040',
  manual:   '1010',
}

// Maps product_type → revenue account code
const REVENUE_ACCOUNT = {
  course:       '4000',
  consultation: '4010',
  coaching:     '4010',
  bundle:       '4000',
  other:        '4020',
}

// Maps expense category → expense account code
const EXPENSE_ACCOUNT_MAP = {
  'Marketing':             '5000',
  'Ads':                   '5000',
  'Meta Ads':              '5160',
  'Hosting':               '5010',
  'Software':              '5020',
  'Monthly Subscription':  '5140',
  'Employees':             '5030',
  'Freelancers':           '5050',
  'Office':                '5060',
  'Taxes':                 '5100',
  'Utilities':             '5110',
  'Travel':                '5070',
  'Education':             '5080',
  'Equipment':             '5090',
  'Phone':                 '5150',
  'Other':                 '5120',
}

// ─── Number generators ────────────────────────────────────────────────────
async function nextSeq(seqName, prefix, pad = 6) {
  const [{ n }] = await sql`SELECT NEXTVAL(${seqName})::int AS n`
  const y = new Date().getFullYear()
  return `${prefix}-${y}-${String(n).padStart(pad, '0')}`
}

// ─── Audit ────────────────────────────────────────────────────────────────
export async function writeFinAudit(actor, role, action, entity, entityId, before, after) {
  try {
    await sql`
      INSERT INTO fin_audit_log (actor_username, actor_role, action, entity_type, entity_id, before_state, after_state)
      VALUES (${actor}, ${role}, ${action}, ${entity}, ${entityId || null},
              ${before ? JSON.stringify(before) : null},
              ${after  ? JSON.stringify(after)  : null})
    `
  } catch { /* silently skip if table missing */ }
}

// ─── Core Double-Entry Engine ─────────────────────────────────────────────

// Get account row by code (throws if not found)
async function getAccount(code) {
  const [a] = await sql`
    SELECT id, code, name, type FROM fin_accounts
    WHERE code = ${code} AND NOT is_deleted LIMIT 1
  `
  if (!a) throw new Error(`Account not found: ${code}`)
  return a
}

// Create journal entry, idempotent by (source_type, source_id)
// Returns entry id. If one already exists for this source, returns existing id.
async function createOrFindJournalEntry({ entryNumber, entryDate, description, sourceType, sourceId, sourceRef, actor }) {
  if (sourceId) {
    const existing = await sql`
      SELECT id FROM fin_journal_entries
      WHERE source_type = ${sourceType} AND source_id = ${sourceId} AND NOT is_deleted
      LIMIT 1
    `
    if (existing.length) return existing[0].id
  }
  const jno = entryNumber || await nextSeq('fin_journal_seq', 'JE', 7)
  const [je] = await sql`
    INSERT INTO fin_journal_entries
      (entry_number, entry_date, description, source_type, source_id, source_ref, created_by)
    VALUES
      (${jno}, ${entryDate || new Date().toISOString().split('T')[0]},
       ${description || null}, ${sourceType || null}, ${sourceId || null},
       ${sourceRef || null}, ${actor || null})
    ON CONFLICT (entry_number) DO UPDATE SET entry_number = fin_journal_entries.entry_number
    RETURNING id
  `
  return je.id
}

/**
 * Post balanced debit/credit lines to a journal entry.
 * Throws if lines are already posted or if SUM(debit) ≠ SUM(credit).
 * Updates fin_accounts.balance in real-time.
 *
 * @param {number} entryId
 * @param {Array<{accountCode, debit, credit, description}>} lines
 */
async function postJournalLines(entryId, lines) {
  // Idempotency — skip if already posted
  const [{ n }] = await sql`SELECT COUNT(*)::int AS n FROM fin_journal_lines WHERE entry_id = ${entryId}`
  if (n > 0) return

  // Validate balance
  const totalDebit  = lines.reduce((s, l) => s + (parseFloat(l.debit)  || 0), 0)
  const totalCredit = lines.reduce((s, l) => s + (parseFloat(l.credit) || 0), 0)
  if (Math.abs(totalDebit - totalCredit) > 0.005) {
    throw new Error(
      `Unbalanced journal entry #${entryId}: DR ${totalDebit.toFixed(2)} ≠ CR ${totalCredit.toFixed(2)}`
    )
  }

  for (const line of lines) {
    const account = await getAccount(line.accountCode)
    const debit   = parseFloat(line.debit)  || 0
    const credit  = parseFloat(line.credit) || 0

    await sql`
      INSERT INTO fin_journal_lines (entry_id, account_id, debit, credit, description)
      VALUES (${entryId}, ${account.id}, ${debit}, ${credit}, ${line.description || null})
    `

    // Normal balance: asset/expense → DR increases; liability/equity/revenue → CR increases
    const isDebitNormal = ['asset', 'expense'].includes(account.type)
    const delta = isDebitNormal ? (debit - credit) : (credit - debit)
    await sql`UPDATE fin_accounts SET balance = balance + ${delta} WHERE id = ${account.id}`
  }
}

// ─── Journal Line Builders (pure, no DB) ─────────────────────────────────

function buildSaleLines(sale) {
  const lines   = []
  const payAcc  = PAYMENT_ACCOUNT[sale.payment_method] || '1010'
  const revAcc  = REVENUE_ACCOUNT[sale.product_type]   || '4020'
  const total   = parseFloat(sale.total)           || 0
  const paid    = parseFloat(sale.amount_paid)     || 0
  const gwFee   = parseFloat(sale.gateway_fee)     || 0
  const inv     = sale.invoice_number || ''
  const prod    = sale.product_name || sale.product_type || ''

  if (sale.payment_status === 'paid') {
    lines.push({ accountCode: payAcc,  debit: total, credit: 0,     description: `Receipt: ${inv}` })
    lines.push({ accountCode: revAcc,  debit: 0,     credit: total, description: `Revenue: ${prod}` })
  } else if (sale.payment_status === 'partial' && paid > 0) {
    const receivable = parseFloat((total - paid).toFixed(2))
    lines.push({ accountCode: payAcc,  debit: paid,       credit: 0,     description: `Partial receipt: ${inv}` })
    lines.push({ accountCode: '1100',  debit: receivable, credit: 0,     description: `Receivable balance: ${inv}` })
    lines.push({ accountCode: revAcc,  debit: 0,          credit: total, description: `Revenue: ${prod}` })
  } else {
    // pending — recognise revenue, record receivable
    lines.push({ accountCode: '1100', debit: total, credit: 0,     description: `Receivable: ${inv}` })
    lines.push({ accountCode: revAcc, debit: 0,     credit: total, description: `Revenue: ${prod}` })
  }

  // Payment gateway fee (if any)
  if (gwFee > 0) {
    lines.push({ accountCode: '5130', debit: gwFee, credit: 0,      description: `Gateway fee: ${inv}` })
    lines.push({ accountCode: payAcc, debit: 0,     credit: gwFee,  description: `Gateway fee deduction: ${inv}` })
  }

  return lines
}

function buildPartialToFullLines(sale) {
  // Called when a partial-payment sale is marked fully paid
  const payAcc     = PAYMENT_ACCOUNT[sale.payment_method] || '1010'
  const total      = parseFloat(sale.total)       || 0
  const alreadyPaid = parseFloat(sale.amount_paid) || 0
  const remaining  = parseFloat((total - alreadyPaid).toFixed(2))
  if (remaining <= 0) return []
  return [
    { accountCode: payAcc,  debit: remaining, credit: 0,         description: `Balance received: ${sale.invoice_number}` },
    { accountCode: '1100',  debit: 0,         credit: remaining, description: `Receivable cleared: ${sale.invoice_number}` },
  ]
}

function buildRefundLines(sale) {
  const payAcc = PAYMENT_ACCOUNT[sale.payment_method] || '1010'
  const refund = parseFloat(sale.refund_amount) || 0
  if (refund <= 0) return []
  return [
    { accountCode: '4040', debit: refund, credit: 0,      description: `Refund: ${sale.invoice_number} — ${sale.refund_reason || ''}` },
    { accountCode: payAcc, debit: 0,      credit: refund, description: `Refund payment: ${sale.invoice_number}` },
  ]
}

function buildExpenseLines(expense) {
  const expAcc  = EXPENSE_ACCOUNT_MAP[expense.category] || '5120'
  const payAcc  = PAYMENT_ACCOUNT[expense.payment_method] || '1010'
  const amount  = parseFloat(expense.amount)     || 0
  const tax     = parseFloat(expense.tax_amount) || 0
  const total   = amount + tax
  const lines   = []

  lines.push({ accountCode: expAcc, debit: amount, credit: 0,     description: expense.description || expense.category })
  if (tax > 0) {
    lines.push({ accountCode: '2030', debit: tax, credit: 0,      description: 'VAT/Tax on expense' })
  }
  lines.push({ accountCode: payAcc, debit: 0,      credit: total, description: `Payment: ${expense.expense_number}` })
  return lines
}

function buildWithdrawalPaidLines(withdrawal) {
  const payAcc = PAYMENT_ACCOUNT[withdrawal.payment_method] || '1010'
  const amount = parseFloat(withdrawal.amount) || 0
  return [
    { accountCode: '2010', debit: amount, credit: 0,      description: `Withdrawal: ${withdrawal.withdrawal_number}` },
    { accountCode: payAcc, debit: 0,      credit: amount, description: `Paid to employee #${withdrawal.employee_id}` },
  ]
}

function buildCommissionEarnedLines(commission, employeeName) {
  const amount = parseFloat(commission.final_amount) || 0
  return [
    { accountCode: '5040', debit: amount, credit: 0,      description: `Commission: ${employeeName || ''}` },
    { accountCode: '2020', debit: 0,      credit: amount, description: `Commission payable: ${employeeName || ''}` },
  ]
}

function buildCommissionPaidLines(amount, paymentMethod) {
  const payAcc = PAYMENT_ACCOUNT[paymentMethod] || '1010'
  return [
    { accountCode: '2020', debit: amount, credit: 0,      description: 'Commission payment' },
    { accountCode: payAcc, debit: 0,      credit: amount, description: 'Commission paid to employee' },
  ]
}

// ─── Dashboard ────────────────────────────────────────────────────────────
export async function getFinanceDashboard({ period = 'month', year, month, dateFrom, dateTo } = {}) {
  const now = new Date()
  const y = parseInt(year  || now.getFullYear())
  const m = parseInt(month || now.getMonth() + 1)

  // Compute explicit date range so all queries use a single BETWEEN filter
  let from, to
  if (period === 'custom' && dateFrom && dateTo) {
    from = dateFrom; to = dateTo
  } else if (period === 'day') {
    from = to = now.toISOString().split('T')[0]
  } else if (period === 'week') {
    const d = new Date(now); d.setDate(d.getDate() - d.getDay())
    from = d.toISOString().split('T')[0]; to = now.toISOString().split('T')[0]
  } else if (period === 'year') {
    from = `${y}-01-01`; to = `${y}-12-31`
  } else {
    const ms = String(m).padStart(2,'0')
    from = `${y}-${ms}-01`; to = `${y}-${ms}-${new Date(y, m, 0).getDate()}`
  }

  const [rev] = await sql`
    SELECT COALESCE(SUM(total),0)::numeric AS total, COUNT(*)::int AS cnt
    FROM fin_sales
    WHERE NOT is_deleted AND payment_status NOT IN ('refunded','cancelled')
      AND sale_date BETWEEN ${from}::date AND ${to}::date
  `
  const prevY = m === 1 ? y - 1 : y
  const prevM = m === 1 ? 12 : m - 1
  const [prevRev] = await sql`
    SELECT COALESCE(SUM(total),0)::numeric AS total FROM fin_sales
    WHERE NOT is_deleted AND payment_status NOT IN ('refunded','cancelled')
      AND EXTRACT(YEAR FROM sale_date) = ${prevY} AND EXTRACT(MONTH FROM sale_date) = ${prevM}
  `
  const [exp] = await sql`
    SELECT COALESCE(SUM(total_amount),0)::numeric AS total FROM fin_expenses
    WHERE NOT is_deleted AND approval_status = 'approved'
      AND expense_date BETWEEN ${from}::date AND ${to}::date
  `
  const [pending]     = await sql`SELECT COALESCE(SUM(total),0)::numeric AS t, COUNT(*)::int AS c FROM fin_sales WHERE NOT is_deleted AND payment_status = 'pending'`
  const [commPending] = await sql`SELECT COALESCE(SUM(final_amount),0)::numeric AS t FROM fin_commissions WHERE NOT is_deleted AND status = 'pending'`
  const [wdPending]   = await sql`SELECT COALESCE(SUM(amount),0)::numeric AS t, COUNT(*)::int AS c FROM fin_withdrawals WHERE NOT is_deleted AND status NOT IN ('rejected','paid')`

  const totalRevenue  = parseFloat(rev.total)
  const totalExpenses = parseFloat(exp.total)
  const prevRevenue   = parseFloat(prevRev.total)
  const growth        = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0

  const [bySource, byProduct, byEmployee, byMethod, byCountry, trend, expTrend] = await Promise.all([
    sql`SELECT COALESCE(source,'Direct') AS source, SUM(total)::numeric AS total, COUNT(*)::int AS cnt
        FROM fin_sales WHERE NOT is_deleted AND payment_status NOT IN ('refunded','cancelled')
        AND sale_date BETWEEN ${from}::date AND ${to}::date
        GROUP BY source ORDER BY total DESC LIMIT 8`,
    sql`SELECT product_type, COALESCE(SUM(total),0)::numeric AS total, COUNT(*)::int AS cnt
        FROM fin_sales WHERE NOT is_deleted AND payment_status NOT IN ('refunded','cancelled')
        AND sale_date BETWEEN ${from}::date AND ${to}::date
        GROUP BY product_type ORDER BY total DESC`,
    sql`SELECT e.name AS emp, COALESCE(SUM(s.total),0)::numeric AS total, COUNT(*)::int AS cnt
        FROM fin_sales s JOIN employees e ON e.id = s.employee_id
        WHERE NOT s.is_deleted AND s.payment_status NOT IN ('refunded','cancelled')
        AND s.sale_date BETWEEN ${from}::date AND ${to}::date
        GROUP BY e.id, e.name ORDER BY total DESC LIMIT 10`,
    sql`SELECT COALESCE(payment_method,'Unknown') AS method, SUM(total)::numeric AS total, COUNT(*)::int AS cnt
        FROM fin_sales WHERE NOT is_deleted AND payment_status NOT IN ('refunded','cancelled')
        AND sale_date BETWEEN ${from}::date AND ${to}::date
        GROUP BY payment_method ORDER BY total DESC`,
    sql`SELECT COALESCE(customer_country,'Unknown') AS country, SUM(total)::numeric AS total, COUNT(*)::int AS cnt
        FROM fin_sales WHERE NOT is_deleted AND payment_status NOT IN ('refunded','cancelled')
        AND sale_date BETWEEN ${from}::date AND ${to}::date
        GROUP BY customer_country ORDER BY total DESC LIMIT 10`,
    sql`SELECT EXTRACT(YEAR FROM sale_date)::int AS yr, EXTRACT(MONTH FROM sale_date)::int AS mo,
               COALESCE(SUM(total),0)::numeric AS revenue, COUNT(*)::int AS cnt
        FROM fin_sales WHERE NOT is_deleted AND payment_status NOT IN ('refunded','cancelled')
        AND sale_date >= CURRENT_DATE - INTERVAL '12 months'
        GROUP BY yr, mo ORDER BY yr, mo`,
    sql`SELECT EXTRACT(YEAR FROM expense_date)::int AS yr, EXTRACT(MONTH FROM expense_date)::int AS mo,
               COALESCE(SUM(total_amount),0)::numeric AS expenses
        FROM fin_expenses WHERE NOT is_deleted AND approval_status = 'approved'
        AND expense_date >= CURRENT_DATE - INTERVAL '12 months'
        GROUP BY yr, mo ORDER BY yr, mo`,
  ])

  const n = r => parseFloat(r.total || r.t || 0)
  return {
    kpis: {
      totalRevenue, totalExpenses,
      netProfit:              totalRevenue - totalExpenses,
      pendingPayments:        parseFloat(pending.t),
      pendingCount:           pending.c,
      pendingCommissions:     parseFloat(commPending.t),
      outstandingWithdrawals: parseFloat(wdPending.t),
      withdrawalCount:        wdPending.c,
      monthlyGrowth:          growth,
      salesCount:             rev.cnt,
    },
    charts: {
      bySource:   bySource.map(r   => ({ name: r.source,       total: n(r), count: r.cnt })),
      byProduct:  byProduct.map(r  => ({ name: r.product_type, total: n(r), count: r.cnt })),
      byEmployee: byEmployee.map(r => ({ name: r.emp,          total: n(r), count: r.cnt })),
      byMethod:   byMethod.map(r   => ({ name: r.method,       total: n(r), count: r.cnt })),
      byCountry:  byCountry.map(r  => ({ name: r.country,      total: n(r), count: r.cnt })),
      trend:      trend.map(r    => ({ yr: r.yr, mo: r.mo, revenue:  parseFloat(r.revenue),  count: r.cnt })),
      expTrend:   expTrend.map(r => ({ yr: r.yr, mo: r.mo, expenses: parseFloat(r.expenses) })),
    },
  }
}

// ─── Sales ────────────────────────────────────────────────────────────────
export async function createSale(data, actorUsername) {
  const inv   = await nextSeq('fin_invoice_seq', 'INV')
  const total = parseFloat(data.total) || 0
  const paid  = data.paymentStatus === 'paid' ? total
              : data.paymentStatus === 'partial' ? (parseFloat(data.amountPaid) || 0) : 0

  // 1. Insert sale (no journal_entry_id yet)
  const [sale] = await sql`
    INSERT INTO fin_sales (
      invoice_number, customer_name, customer_email, customer_phone, customer_country,
      employee_id, lead_id, product_type, product_name, course_id, consultation_id,
      subtotal, discount_amount, discount_pct, coupon_code, tax_rate, tax_amount,
      total, amount_paid, gateway_fee, gateway_fee_pct,
      currency, payment_method, payment_status, source, notes, sale_date
    ) VALUES (
      ${inv},
      ${data.customerName   || null}, ${data.customerEmail   || null},
      ${data.customerPhone  || null}, ${data.customerCountry || null},
      ${data.employeeId     || null}, ${data.leadId          || null},
      ${data.productType    || 'other'}, ${data.productName  || null},
      ${data.courseId       || null},    ${data.consultationId || null},
      ${data.subtotal       || total},   ${data.discountAmount || 0},
      ${data.discountPct    || 0},       ${data.couponCode    || null},
      ${data.taxRate        || 0},       ${data.taxAmount     || 0},
      ${total}, ${paid}, ${data.gatewayFee || 0}, ${data.gatewayFeePct || 0},
      ${data.currency       || 'JOD'}, ${data.paymentMethod  || 'manual'},
      ${data.paymentStatus  || 'pending'}, ${data.source     || null},
      ${data.notes          || null},
      ${data.saleDate       || new Date().toISOString().split('T')[0]}
    ) RETURNING *
  `

  // 2. Create journal entry + post lines
  try {
    const jno    = await nextSeq('fin_journal_seq', 'JE', 7)
    const entryId = await createOrFindJournalEntry({
      entryNumber: jno,
      entryDate:   sale.sale_date,
      description: `Sale: ${inv} — ${data.productName || data.productType || ''}`,
      sourceType:  'sale',
      sourceId:    sale.id,
      sourceRef:   inv,
      actor:       actorUsername,
    })
    await postJournalLines(entryId, buildSaleLines({ ...sale, amount_paid: paid }))
    await sql`UPDATE fin_sales SET journal_entry_id = ${entryId} WHERE id = ${sale.id}`
  } catch (e) {
    console.error('[finance-db] Journal error on createSale:', e.message)
  }

  // 3. Auto-commission
  if (data.employeeId && data.paymentStatus === 'paid') {
    await autoCommission(sale.id, data.employeeId, total, data.productType)
  }

  await writeFinAudit(actorUsername, 'admin', 'create_sale', 'sale', sale.id, null, { inv, total })
  return sale
}

export async function getSales({ search = null, status = null, employeeId = null,
  dateFrom = null, dateTo = null, productType = null, page = 1, limit = 50 } = {}) {
  const offset = (page - 1) * limit
  const rows = await sql`
    SELECT s.*, e.name AS employee_name
    FROM fin_sales s LEFT JOIN employees e ON e.id = s.employee_id
    WHERE NOT s.is_deleted
      AND (${search}::text    IS NULL OR s.customer_name ILIKE '%' || ${search} || '%'
                                      OR s.invoice_number ILIKE '%' || ${search} || '%'
                                      OR s.product_name ILIKE '%' || ${search} || '%')
      AND (${status}::varchar       IS NULL OR s.payment_status  = ${status})
      AND (${employeeId}::integer   IS NULL OR s.employee_id     = ${employeeId})
      AND (${dateFrom}::date        IS NULL OR s.sale_date       >= ${dateFrom}::date)
      AND (${dateTo}::date          IS NULL OR s.sale_date       <= ${dateTo}::date)
      AND (${productType}::varchar  IS NULL OR s.product_type    = ${productType})
    ORDER BY s.created_at DESC LIMIT ${limit} OFFSET ${offset}
  `
  const [{ n }] = await sql`
    SELECT COUNT(*)::int AS n FROM fin_sales s WHERE NOT s.is_deleted
      AND (${search}::text   IS NULL OR s.customer_name ILIKE '%' || ${search} || '%'
                                     OR s.invoice_number ILIKE '%' || ${search} || '%')
      AND (${status}::varchar      IS NULL OR s.payment_status = ${status})
      AND (${employeeId}::integer  IS NULL OR s.employee_id    = ${employeeId})
      AND (${dateFrom}::date       IS NULL OR s.sale_date      >= ${dateFrom}::date)
      AND (${dateTo}::date         IS NULL OR s.sale_date      <= ${dateTo}::date)
      AND (${productType}::varchar IS NULL OR s.product_type   = ${productType})
  `
  return { sales: rows, total: n, pages: Math.ceil(n / limit), page }
}

export async function getSaleById(id) {
  const [s] = await sql`
    SELECT s.*, e.name AS employee_name
    FROM fin_sales s LEFT JOIN employees e ON e.id = s.employee_id
    WHERE s.id = ${id} AND NOT s.is_deleted LIMIT 1
  `
  return s || null
}

export async function updateSale(id, updates, actorUsername) {
  const before = await getSaleById(id)
  if (!before) throw new Error('Sale not found')

  await sql`
    UPDATE fin_sales SET
      customer_name    = COALESCE(${updates.customerName    ?? null}, customer_name),
      customer_email   = COALESCE(${updates.customerEmail   ?? null}, customer_email),
      customer_phone   = COALESCE(${updates.customerPhone   ?? null}, customer_phone),
      customer_country = COALESCE(${updates.customerCountry ?? null}, customer_country),
      payment_status   = COALESCE(${updates.paymentStatus   ?? null}, payment_status),
      payment_method   = COALESCE(${updates.paymentMethod   ?? null}, payment_method),
      refund_status    = COALESCE(${updates.refundStatus    ?? null}, refund_status),
      refund_amount    = COALESCE(${updates.refundAmount    ?? null}::numeric, refund_amount),
      refund_reason    = COALESCE(${updates.refundReason    ?? null}, refund_reason),
      notes            = COALESCE(${updates.notes           ?? null}, notes),
      total            = COALESCE(${updates.total           ?? null}::numeric, total),
      updated_at       = now()
    WHERE id = ${id}
  `
  const after = await getSaleById(id)

  // ── Journal entries for status transitions ──
  try {
    const newStatus    = updates.paymentStatus
    const newRefund    = updates.refundStatus
    const wasPartial   = before.payment_status === 'partial'
    const wasPending   = before.payment_status === 'pending'

    // pending/partial → paid: record receipt of remaining balance
    if (newStatus === 'paid' && (wasPending || wasPartial)) {
      const jno     = await nextSeq('fin_journal_seq', 'JE', 7)
      const entryId = await createOrFindJournalEntry({
        entryNumber: jno,
        entryDate:   new Date().toISOString().split('T')[0],
        description: `Payment received: ${before.invoice_number}`,
        sourceType:  'sale_payment',
        sourceId:    id,
        sourceRef:   before.invoice_number,
        actor:       actorUsername,
      })
      const lines = wasPartial
        ? buildPartialToFullLines(before)
        : buildSaleLines({ ...after, payment_status: 'paid', amount_paid: after.total })
      if (lines.length) await postJournalLines(entryId, lines)
      await sql`UPDATE fin_sales SET amount_paid = total WHERE id = ${id}`
    }

    // Refund journal entry
    if (newRefund && newRefund !== 'none' && before.refund_status === 'none') {
      const refundAmount = parseFloat(updates.refundAmount || after.total)
      const jno     = await nextSeq('fin_journal_seq', 'JE', 7)
      const entryId = await createOrFindJournalEntry({
        entryNumber: jno,
        entryDate:   new Date().toISOString().split('T')[0],
        description: `Refund: ${before.invoice_number}`,
        sourceType:  'sale_refund',
        sourceId:    id,
        sourceRef:   before.invoice_number,
        actor:       actorUsername,
      })
      const refundSale = { ...after, refund_amount: refundAmount, refund_reason: updates.refundReason }
      await postJournalLines(entryId, buildRefundLines(refundSale))
      await sql`UPDATE fin_sales SET refunded_at = now() WHERE id = ${id}`
    }
  } catch (e) {
    console.error('[finance-db] Journal error on updateSale:', e.message)
  }

  await writeFinAudit(actorUsername, 'admin', 'update_sale', 'sale', id, before, after)
  return after
}

export async function softDeleteSale(id, actorUsername) {
  await sql`UPDATE fin_sales SET is_deleted = TRUE, deleted_at = now() WHERE id = ${id}`
  await writeFinAudit(actorUsername, 'admin', 'delete_sale', 'sale', id, null, null)
}

// ─── Expenses ─────────────────────────────────────────────────────────────
export async function createExpense(data, actorUsername) {
  const expNo      = await nextSeq('fin_expense_seq', 'EXP')
  const total      = parseFloat(data.amount) + parseFloat(data.taxAmount || 0)
  const approvedAt = data.approvalStatus === 'approved' ? new Date().toISOString() : null

  const [exp] = await sql`
    INSERT INTO fin_expenses (
      expense_number, category, sub_category, vendor, description,
      amount, currency, tax_amount, total_amount,
      employee_id, payment_method, payment_status,
      approval_status, approved_by, approved_at,
      is_recurring, recurrence_pattern, recurrence_end_date,
      expense_date, notes
    ) VALUES (
      ${expNo}, ${data.category}, ${data.subCategory || null}, ${data.vendor || null}, ${data.description || null},
      ${data.amount}, ${data.currency || 'JOD'}, ${data.taxAmount || 0}, ${data.totalAmount || total},
      ${data.employeeId || null}, ${data.paymentMethod || null}, ${data.paymentStatus || 'paid'},
      ${data.approvalStatus || 'approved'},
      ${data.approvalStatus === 'approved' ? actorUsername : null}, ${approvedAt},
      ${data.isRecurring || false}, ${data.recurrencePattern || null}, ${data.recurrenceEndDate || null},
      ${data.expenseDate || new Date().toISOString().split('T')[0]}, ${data.notes || null}
    ) RETURNING *
  `

  // Post journal lines only for approved + paid expenses
  if (exp.approval_status === 'approved' && exp.payment_status === 'paid') {
    try {
      const jno     = await nextSeq('fin_journal_seq', 'JE', 7)
      const entryId = await createOrFindJournalEntry({
        entryNumber: jno,
        entryDate:   exp.expense_date,
        description: `Expense: ${expNo} — ${data.category}`,
        sourceType:  'expense',
        sourceId:    exp.id,
        sourceRef:   expNo,
        actor:       actorUsername,
      })
      await postJournalLines(entryId, buildExpenseLines(exp))
      await sql`UPDATE fin_expenses SET journal_entry_id = ${entryId} WHERE id = ${exp.id}`
    } catch (e) {
      console.error('[finance-db] Journal error on createExpense:', e.message)
    }
  }

  await writeFinAudit(actorUsername, 'admin', 'create_expense', 'expense', exp.id, null, { expNo, total })
  return exp
}

export async function getExpenses({ search = null, category = null, status = null,
  dateFrom = null, dateTo = null, page = 1, limit = 50 } = {}) {
  const offset = (page - 1) * limit
  const rows = await sql`
    SELECT ex.*, e.name AS employee_name
    FROM fin_expenses ex LEFT JOIN employees e ON e.id = ex.employee_id
    WHERE NOT ex.is_deleted
      AND (${search}::text    IS NULL OR ex.vendor ILIKE '%' || ${search} || '%'
                                      OR ex.description ILIKE '%' || ${search} || '%'
                                      OR ex.expense_number ILIKE '%' || ${search} || '%')
      AND (${category}::varchar IS NULL OR ex.category = ${category})
      AND (${status}::varchar   IS NULL OR ex.approval_status = ${status})
      AND (${dateFrom}::date    IS NULL OR ex.expense_date >= ${dateFrom}::date)
      AND (${dateTo}::date      IS NULL OR ex.expense_date <= ${dateTo}::date)
    ORDER BY ex.created_at DESC LIMIT ${limit} OFFSET ${offset}
  `
  const [{ n }] = await sql`
    SELECT COUNT(*)::int AS n FROM fin_expenses WHERE NOT is_deleted
      AND (${search}::text   IS NULL OR vendor ILIKE '%' || ${search} || '%'
                                     OR description ILIKE '%' || ${search} || '%')
      AND (${category}::varchar IS NULL OR category = ${category})
      AND (${status}::varchar   IS NULL OR approval_status = ${status})
  `
  return { expenses: rows, total: n, pages: Math.ceil(n / limit), page }
}

export async function updateExpense(id, updates, actorUsername) {
  const [before] = await sql`SELECT * FROM fin_expenses WHERE id = ${id} LIMIT 1`
  const approvedAt = updates.approvalStatus === 'approved' ? new Date().toISOString() : null

  await sql`
    UPDATE fin_expenses SET
      approval_status  = COALESCE(${updates.approvalStatus ?? null}, approval_status),
      approval_notes   = COALESCE(${updates.approvalNotes  ?? null}, approval_notes),
      approved_by      = CASE WHEN ${updates.approvalStatus ?? null} = 'approved' THEN ${actorUsername} ELSE approved_by END,
      approved_at      = CASE WHEN ${updates.approvalStatus ?? null} = 'approved' THEN ${approvedAt}::timestamptz ELSE approved_at END,
      payment_status   = COALESCE(${updates.paymentStatus  ?? null}, payment_status),
      notes            = COALESCE(${updates.notes          ?? null}, notes),
      updated_at       = now()
    WHERE id = ${id}
  `
  const [after] = await sql`SELECT * FROM fin_expenses WHERE id = ${id}`

  // Post journal if newly approved + paid and no journal yet
  if (updates.approvalStatus === 'approved' && before.approval_status !== 'approved'
      && after.payment_status === 'paid' && !after.journal_entry_id) {
    try {
      const jno     = await nextSeq('fin_journal_seq', 'JE', 7)
      const entryId = await createOrFindJournalEntry({
        entryNumber: jno,
        entryDate:   after.expense_date,
        description: `Expense approved: ${after.expense_number} — ${after.category}`,
        sourceType:  'expense',
        sourceId:    id,
        sourceRef:   after.expense_number,
        actor:       actorUsername,
      })
      await postJournalLines(entryId, buildExpenseLines(after))
      await sql`UPDATE fin_expenses SET journal_entry_id = ${entryId} WHERE id = ${id}`
    } catch (e) {
      console.error('[finance-db] Journal error on updateExpense approval:', e.message)
    }
  }

  await writeFinAudit(actorUsername, 'admin', 'update_expense', 'expense', id, before, after)
  return after
}

export async function softDeleteExpense(id, actorUsername) {
  await sql`UPDATE fin_expenses SET is_deleted = TRUE, deleted_at = now() WHERE id = ${id}`
  await writeFinAudit(actorUsername, 'admin', 'delete_expense', 'expense', id, null, null)
}

// ─── Withdrawals ──────────────────────────────────────────────────────────
export async function createWithdrawal({ employeeId, amount, currency = 'JOD', reason }, actorUsername) {
  const wdNo = await nextSeq('fin_withdrawal_seq', 'WD', 5)
  const [wd] = await sql`
    INSERT INTO fin_withdrawals (withdrawal_number, employee_id, amount, currency, reason)
    VALUES (${wdNo}, ${employeeId}, ${amount}, ${currency}, ${reason || null})
    RETURNING *
  `
  await writeFinAudit(actorUsername, 'employee', 'create_withdrawal', 'withdrawal', wd.id, null, { wdNo, amount })
  return wd
}

export async function getWithdrawals({ employeeId = null, status = null, page = 1, limit = 50 } = {}) {
  const offset = (page - 1) * limit
  const rows = await sql`
    SELECT w.*, e.name AS employee_name, e.username AS employee_username
    FROM fin_withdrawals w JOIN employees e ON e.id = w.employee_id
    WHERE NOT w.is_deleted
      AND (${employeeId}::integer IS NULL OR w.employee_id = ${employeeId})
      AND (${status}::varchar     IS NULL OR w.status      = ${status})
    ORDER BY w.requested_at DESC LIMIT ${limit} OFFSET ${offset}
  `
  const [{ n }] = await sql`
    SELECT COUNT(*)::int AS n FROM fin_withdrawals
    WHERE NOT is_deleted
      AND (${employeeId}::integer IS NULL OR employee_id = ${employeeId})
      AND (${status}::varchar     IS NULL OR status      = ${status})
  `
  return { withdrawals: rows, total: n, pages: Math.ceil(n / limit), page }
}

export async function updateWithdrawal(id, updates, actorUsername) {
  const [before] = await sql`SELECT * FROM fin_withdrawals WHERE id = ${id}`
  const approvedAt = updates.status === 'approved' ? new Date().toISOString() : null
  const rejectedAt = updates.status === 'rejected' ? new Date().toISOString() : null

  await sql`
    UPDATE fin_withdrawals SET
      status           = ${updates.status},
      approved_by      = COALESCE(${updates.approvedBy     ?? null}, approved_by),
      approval_notes   = COALESCE(${updates.approvalNotes  ?? null}, approval_notes),
      approved_at      = CASE WHEN ${updates.status} = 'approved' THEN ${approvedAt}::timestamptz ELSE approved_at END,
      rejected_at      = CASE WHEN ${updates.status} = 'rejected' THEN ${rejectedAt}::timestamptz ELSE rejected_at END,
      payment_date     = COALESCE(${updates.paymentDate    ?? null}::date, payment_date),
      payment_method   = COALESCE(${updates.paymentMethod  ?? null}, payment_method),
      reference_number = COALESCE(${updates.referenceNumber ?? null}, reference_number),
      updated_at       = now()
    WHERE id = ${id}
  `
  const [after] = await sql`SELECT * FROM fin_withdrawals WHERE id = ${id}`

  // Journal entry when withdrawal is paid
  if (updates.status === 'paid' && before.status !== 'paid') {
    try {
      const jno     = await nextSeq('fin_journal_seq', 'JE', 7)
      const entryId = await createOrFindJournalEntry({
        entryNumber: jno,
        entryDate:   updates.paymentDate || new Date().toISOString().split('T')[0],
        description: `Withdrawal paid: ${before.withdrawal_number}`,
        sourceType:  'withdrawal',
        sourceId:    id,
        sourceRef:   before.withdrawal_number,
        actor:       actorUsername,
      })
      await postJournalLines(entryId, buildWithdrawalPaidLines({ ...after, withdrawal_number: before.withdrawal_number }))
    } catch (e) {
      console.error('[finance-db] Journal error on withdrawal paid:', e.message)
    }
  }

  await writeFinAudit(actorUsername, 'admin', `withdrawal_${updates.status}`, 'withdrawal', id, before, after)
  return after
}

// ─── Commissions ──────────────────────────────────────────────────────────
async function autoCommission(saleId, employeeId, saleAmount, productType) {
  const now = new Date()
  const [rule] = await sql`
    SELECT * FROM fin_commission_rules
    WHERE is_active = TRUE
      AND (employee_id = ${employeeId} OR employee_id IS NULL)
      AND (effective_from IS NULL OR effective_from <= CURRENT_DATE)
      AND (effective_until IS NULL OR effective_until >= CURRENT_DATE)
    ORDER BY employee_id DESC NULLS LAST LIMIT 1
  `
  if (!rule) return null

  let amount = 0
  if (rule.rule_type === 'percentage') {
    amount = parseFloat(saleAmount) * parseFloat(rule.rate)
  } else if (rule.rule_type === 'fixed') {
    amount = parseFloat(rule.fixed_amount)
  } else if (rule.rule_type === 'tiered') {
    const tiers = rule.tier_config || []
    for (const t of tiers) {
      if (saleAmount >= t.min && (t.max == null || saleAmount <= t.max)) {
        amount = parseFloat(saleAmount) * t.rate; break
      }
    }
  }
  if (amount <= 0) return null

  const [c] = await sql`
    INSERT INTO fin_commissions (employee_id, sale_id, period_year, period_month,
      commission_type, gross_sale_amount, rate, commission_amount, final_amount)
    VALUES (${employeeId}, ${saleId}, ${now.getFullYear()}, ${now.getMonth() + 1},
            'sale', ${saleAmount}, ${rule.rate || 0}, ${amount}, ${amount})
    RETURNING *
  `

  // Journal: commission expense earned
  try {
    const [emp] = await sql`SELECT name FROM employees WHERE id = ${employeeId} LIMIT 1`
    const jno     = await nextSeq('fin_journal_seq', 'JE', 7)
    const entryId = await createOrFindJournalEntry({
      entryNumber: jno,
      entryDate:   new Date().toISOString().split('T')[0],
      description: `Commission earned: ${emp?.name || ''} — Sale #${saleId}`,
      sourceType:  'commission_earned',
      sourceId:    c.id,
      actor:       'system',
    })
    await postJournalLines(entryId, buildCommissionEarnedLines(c, emp?.name))
  } catch (e) {
    console.error('[finance-db] Journal error on autoCommission:', e.message)
  }
  return c
}

export async function getCommissions({ employeeId = null, year, month, status = null, page = 1, limit = 50 } = {}) {
  const now = new Date()
  const y = parseInt(year  || now.getFullYear())
  const m = parseInt(month || now.getMonth() + 1)
  const offset = (page - 1) * limit

  const [rows, leaderboard, totals] = await Promise.all([
    sql`SELECT c.*, e.name AS employee_name, s.invoice_number, s.customer_name, s.product_name
        FROM fin_commissions c
        JOIN employees e ON e.id = c.employee_id
        LEFT JOIN fin_sales s ON s.id = c.sale_id
        WHERE NOT c.is_deleted
          AND c.period_year = ${y} AND c.period_month = ${m}
          AND (${employeeId}::integer IS NULL OR c.employee_id = ${employeeId})
          AND (${status}::varchar     IS NULL OR c.status      = ${status})
        ORDER BY c.created_at DESC LIMIT ${limit} OFFSET ${offset}`,
    sql`SELECT e.id, e.name, e.username,
               COALESCE(SUM(c.final_amount),0)::numeric AS total,
               COUNT(CASE WHEN c.commission_type = 'sale' THEN 1 END)::int AS sales,
               COALESCE(SUM(CASE WHEN c.status='paid'    THEN c.final_amount ELSE 0 END),0)::numeric AS paid,
               COALESCE(SUM(CASE WHEN c.status='pending' THEN c.final_amount ELSE 0 END),0)::numeric AS pending_amt
        FROM employees e
        LEFT JOIN fin_commissions c ON c.employee_id = e.id AND NOT c.is_deleted
          AND c.period_year = ${y} AND c.period_month = ${m}
        GROUP BY e.id, e.name, e.username ORDER BY total DESC`,
    sql`SELECT COALESCE(SUM(final_amount),0)::numeric AS total,
               COALESCE(SUM(CASE WHEN status='paid' THEN final_amount ELSE 0 END),0)::numeric AS paid,
               COALESCE(SUM(CASE WHEN status='pending' THEN final_amount ELSE 0 END),0)::numeric AS pending_amt
        FROM fin_commissions
        WHERE NOT is_deleted AND period_year = ${y} AND period_month = ${m}
          AND (${employeeId}::integer IS NULL OR employee_id = ${employeeId})`,
  ])

  const pf = v => parseFloat(v || 0)
  return {
    commissions: rows,
    leaderboard: leaderboard.map(r => ({ ...r, total: pf(r.total), paid: pf(r.paid), pending_amt: pf(r.pending_amt) })),
    totals: { total: pf(totals[0].total), paid: pf(totals[0].paid), pending: pf(totals[0].pending_amt) },
    period: { year: y, month: m },
  }
}

export async function addCommissionAdjustment({ employeeId, year, month, amount, reason, type = 'adjustment' }, actorUsername) {
  const now = new Date()
  const [c] = await sql`
    INSERT INTO fin_commissions (employee_id, period_year, period_month, commission_type,
      commission_amount, adjustment_amount, final_amount, adjustment_reason, notes)
    VALUES (${employeeId}, ${year || now.getFullYear()}, ${month || now.getMonth() + 1},
            ${type}, ${amount}, ${amount}, ${amount}, ${reason || null}, ${reason || null})
    RETURNING *
  `
  // Journal for bonus/adjustment
  try {
    const [emp] = await sql`SELECT name FROM employees WHERE id = ${employeeId} LIMIT 1`
    const lines = type === 'penalty'
      ? [ // reverse: employee owes back
          { accountCode: '2020', debit: parseFloat(amount), credit: 0, description: `Penalty deduction: ${emp?.name}` },
          { accountCode: '5040', debit: 0, credit: parseFloat(amount), description: `Commission reversal: ${emp?.name}` },
        ]
      : buildCommissionEarnedLines(c, emp?.name)
    const jno     = await nextSeq('fin_journal_seq', 'JE', 7)
    const entryId = await createOrFindJournalEntry({
      entryNumber: jno,
      entryDate:   new Date().toISOString().split('T')[0],
      description: `Commission ${type}: ${emp?.name} — ${reason || ''}`,
      sourceType:  'commission_adj',
      sourceId:    c.id,
      actor:       actorUsername,
    })
    await postJournalLines(entryId, lines)
  } catch (e) {
    console.error('[finance-db] Journal error on addCommissionAdjustment:', e.message)
  }
  await writeFinAudit(actorUsername, 'admin', 'commission_adjustment', 'commission', c.id, null, { type, amount })
  return c
}

export async function markCommissionsPaid(ids, paymentRef, actorUsername) {
  await sql`
    UPDATE fin_commissions SET status = 'paid', paid_at = now(), payment_reference = ${paymentRef || null}
    WHERE id = ANY(${ids}::int[])
  `
  // Journal: commissions payable → bank
  try {
    const rows = await sql`
      SELECT c.*, e.name AS employee_name FROM fin_commissions c
      JOIN employees e ON e.id = c.employee_id
      WHERE c.id = ANY(${ids}::int[])
    `
    const totalPaid = rows.reduce((s, r) => s + parseFloat(r.final_amount), 0)
    if (totalPaid > 0) {
      const jno     = await nextSeq('fin_journal_seq', 'JE', 7)
      const entryId = await createOrFindJournalEntry({
        entryNumber: jno,
        entryDate:   new Date().toISOString().split('T')[0],
        description: `Commissions paid — ref: ${paymentRef || 'manual'}`,
        sourceType:  'commission_payment',
        sourceId:    ids[0], // use first id as ref
        actor:       actorUsername,
      })
      await postJournalLines(entryId, buildCommissionPaidLines(totalPaid, 'bank'))
    }
  } catch (e) {
    console.error('[finance-db] Journal error on markCommissionsPaid:', e.message)
  }
  await writeFinAudit(actorUsername, 'admin', 'commissions_paid', 'commission', null, null, { ids, paymentRef })
}

export async function getCommissionRules() {
  return await sql`
    SELECT r.*, e.name AS employee_name FROM fin_commission_rules r
    LEFT JOIN employees e ON e.id = r.employee_id
    ORDER BY r.created_at ASC
  `
}

export async function upsertCommissionRule(data, actorUsername) {
  if (data.id) {
    const [r] = await sql`
      UPDATE fin_commission_rules SET
        rule_type = ${data.ruleType}, rate = ${data.rate || 0},
        fixed_amount = ${data.fixedAmount || 0},
        tier_config = ${JSON.stringify(data.tierConfig || [])}::jsonb,
        monthly_bonus_threshold = ${data.monthlyBonusThreshold || null},
        monthly_bonus_amount    = ${data.monthlyBonusAmount || null},
        is_active = ${data.isActive !== false}, notes = ${data.notes || null}
      WHERE id = ${data.id} RETURNING *
    `
    return r
  }
  const [r] = await sql`
    INSERT INTO fin_commission_rules (employee_id, applies_to, rule_type, rate, fixed_amount,
      tier_config, monthly_bonus_threshold, monthly_bonus_amount, notes)
    VALUES (${data.employeeId || null}, ${data.appliesTo || 'all'}, ${data.ruleType},
            ${data.rate || 0}, ${data.fixedAmount || 0},
            ${JSON.stringify(data.tierConfig || [])}::jsonb,
            ${data.monthlyBonusThreshold || null}, ${data.monthlyBonusAmount || null},
            ${data.notes || null})
    RETURNING *
  `
  await writeFinAudit(actorUsername, 'admin', 'create_commission_rule', 'commission_rule', r.id, null, data)
  return r
}

export async function deleteCommissionRule(id, actorUsername) {
  await sql`UPDATE fin_commission_rules SET is_active = FALSE WHERE id = ${id}`
  await writeFinAudit(actorUsername, 'admin', 'delete_commission_rule', 'commission_rule', id, null, null)
}

// ─── Accounts & Ledger ────────────────────────────────────────────────────
export async function getAccounts() {
  return await sql`SELECT * FROM fin_accounts WHERE NOT is_deleted ORDER BY code ASC`
}

export async function getJournalEntries({ dateFrom = null, dateTo = null, sourceType = null, page = 1, limit = 50 } = {}) {
  const offset = (page - 1) * limit
  const rows = await sql`
    SELECT je.*,
      COALESCE(
        json_agg(
          json_build_object('code', fa.code, 'name', fa.name, 'debit', jl.debit, 'credit', jl.credit, 'desc', jl.description)
          ORDER BY jl.id
        ) FILTER (WHERE jl.id IS NOT NULL), '[]'
      ) AS lines
    FROM fin_journal_entries je
    LEFT JOIN fin_journal_lines jl ON jl.entry_id = je.id
    LEFT JOIN fin_accounts fa ON fa.id = jl.account_id
    WHERE NOT je.is_deleted
      AND (${dateFrom}::date IS NULL OR je.entry_date >= ${dateFrom}::date)
      AND (${dateTo}::date   IS NULL OR je.entry_date <= ${dateTo}::date)
      AND (${sourceType}::varchar IS NULL OR je.source_type = ${sourceType})
    GROUP BY je.id ORDER BY je.entry_date DESC, je.id DESC
    LIMIT ${limit} OFFSET ${offset}
  `
  const [{ n }] = await sql`SELECT COUNT(*)::int AS n FROM fin_journal_entries WHERE NOT is_deleted`
  return { entries: rows, total: n, pages: Math.ceil(n / limit), page }
}

// ─── Fiscal Year ──────────────────────────────────────────────────────────
// First fiscal year: 2026-08-01 → 2026-12-31
// All subsequent: YYYY-01-01 → YYYY-12-31
export function getFiscalYear(year) {
  const y = parseInt(year) || new Date().getFullYear()
  if (y === 2026) return { year: 2026, start: '2026-08-01', end: '2026-12-31' }
  return { year: y, start: `${y}-01-01`, end: `${y}-12-31` }
}
export function currentFiscalYear() { return getFiscalYear(new Date().getFullYear()) }

// ─── Reports ──────────────────────────────────────────────────────────────
export async function getPLReport({ dateFrom, dateTo } = {}) {
  const fy   = currentFiscalYear()
  const from = dateFrom || fy.start
  const to   = dateTo   || fy.end
  const [revenue, expenses] = await Promise.all([
    sql`SELECT product_type AS label, COALESCE(SUM(total),0)::numeric AS total, COUNT(*)::int AS cnt
        FROM fin_sales WHERE NOT is_deleted AND payment_status NOT IN ('refunded','cancelled')
        AND sale_date BETWEEN ${from}::date AND ${to}::date GROUP BY product_type`,
    sql`SELECT category AS label, COALESCE(SUM(total_amount),0)::numeric AS total, COUNT(*)::int AS cnt
        FROM fin_expenses WHERE NOT is_deleted AND approval_status = 'approved'
        AND expense_date BETWEEN ${from}::date AND ${to}::date GROUP BY category ORDER BY total DESC`,
  ])
  const pf = v => parseFloat(v || 0)
  const totalRev = revenue.reduce((s, r) => s + pf(r.total), 0)
  const totalExp = expenses.reduce((s, r) => s + pf(r.total), 0)
  return {
    period: { from, to },
    revenue:  revenue.map(r  => ({ ...r, total: pf(r.total) })),
    expenses: expenses.map(r => ({ ...r, total: pf(r.total) })),
    totalRevenue: totalRev, totalExpenses: totalExp,
    grossProfit:  totalRev - totalExp,
    grossMargin:  totalRev > 0 ? ((totalRev - totalExp) / totalRev * 100).toFixed(1) : '0',
  }
}

export async function getCashFlowReport({ year, month } = {}) {
  const now = new Date()
  const y = parseInt(year  || now.getFullYear())
  const m = parseInt(month || now.getMonth() + 1)
  const [inflows, outflows] = await Promise.all([
    sql`SELECT sale_date::text AS date, total::numeric AS amount, invoice_number AS ref, customer_name AS desc
        FROM fin_sales WHERE NOT is_deleted AND payment_status = 'paid'
        AND EXTRACT(YEAR FROM sale_date) = ${y} AND EXTRACT(MONTH FROM sale_date) = ${m}
        ORDER BY sale_date`,
    sql`SELECT expense_date::text AS date, total_amount::numeric AS amount, expense_number AS ref, category AS desc
        FROM fin_expenses WHERE NOT is_deleted AND approval_status = 'approved' AND payment_status = 'paid'
        AND EXTRACT(YEAR FROM expense_date) = ${y} AND EXTRACT(MONTH FROM expense_date) = ${m}
        ORDER BY expense_date`,
  ])
  const pf = r => ({ ...r, amount: parseFloat(r.amount) })
  const totalIn  = inflows.reduce((s, r) => s + parseFloat(r.amount), 0)
  const totalOut = outflows.reduce((s, r) => s + parseFloat(r.amount), 0)
  return {
    period: { year: y, month: m },
    inflows: inflows.map(pf), outflows: outflows.map(pf),
    totalInflows: totalIn, totalOutflows: totalOut,
    netCashFlow: totalIn - totalOut,
  }
}

export async function getAuditLog({ page = 1, limit = 50 } = {}) {
  const offset = (page - 1) * limit
  const rows = await sql`SELECT * FROM fin_audit_log ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`
  const [{ n }] = await sql`SELECT COUNT(*)::int AS n FROM fin_audit_log`
  return { logs: rows, total: n, pages: Math.ceil(n / limit), page }
}

export async function getEmployeesForFinance() {
  return await sql`SELECT id, name, username FROM employees ORDER BY name ASC`
}

// ─── Balance Sheet ────────────────────────────────────────────────────────
export async function getBalanceSheet({ asOfDate } = {}) {
  const date = asOfDate || new Date().toISOString().split('T')[0]
  const accounts = await sql`
    SELECT code, name, type, balance::numeric AS balance, category
    FROM fin_accounts
    WHERE NOT is_deleted AND type IN ('asset','liability','equity')
    ORDER BY code
  `
  const [profitRow] = await sql`
    SELECT
      COALESCE((SELECT SUM(balance) FROM fin_accounts WHERE type = 'revenue' AND NOT is_deleted), 0)::numeric
      - COALESCE((SELECT SUM(balance) FROM fin_accounts WHERE type = 'expense' AND NOT is_deleted), 0)::numeric
      AS net_profit
  `
  const pf = v => parseFloat(v || 0)
  const assets      = accounts.filter(a => a.type === 'asset')
  const liabilities = accounts.filter(a => a.type === 'liability')
  const equity      = accounts.filter(a => a.type === 'equity')
  const retainedEarnings = pf(profitRow.net_profit)
  const totalEquityWithRetained = equity.reduce((s, a) => s + pf(a.balance), 0) + retainedEarnings
  return {
    asOfDate: date,
    assets:      assets.map(a      => ({ code:a.code, name:a.name, balance:pf(a.balance), category:a.category })),
    liabilities: liabilities.map(a => ({ code:a.code, name:a.name, balance:pf(a.balance), category:a.category })),
    equity:      equity.map(a      => ({ code:a.code, name:a.name, balance:pf(a.balance), category:a.category })),
    totalAssets:      assets.reduce((s, a) => s + pf(a.balance), 0),
    totalLiabilities: liabilities.reduce((s, a) => s + pf(a.balance), 0),
    totalEquity:      totalEquityWithRetained,
    retainedEarnings,
  }
}

// ─── Trial Balance ────────────────────────────────────────────────────────
export async function getTrialBalance({ dateFrom, dateTo } = {}) {
  const fy   = currentFiscalYear()
  const from = dateFrom || fy.start
  const to   = dateTo   || fy.end
  const rows = await sql`
    SELECT
      fa.code, fa.name, fa.type, fa.category,
      COALESCE(SUM(jl.debit),  0)::numeric AS total_debit,
      COALESCE(SUM(jl.credit), 0)::numeric AS total_credit
    FROM fin_accounts fa
    LEFT JOIN fin_journal_lines jl ON jl.account_id = fa.id
    LEFT JOIN fin_journal_entries je ON je.id = jl.entry_id
      AND NOT je.is_deleted
      AND je.entry_date BETWEEN ${from}::date AND ${to}::date
    WHERE NOT fa.is_deleted
    GROUP BY fa.id, fa.code, fa.name, fa.type, fa.category
    ORDER BY fa.code
  `
  const pf = v => parseFloat(v || 0)
  const totalDebit  = rows.reduce((s, r) => s + pf(r.total_debit),  0)
  const totalCredit = rows.reduce((s, r) => s + pf(r.total_credit), 0)
  return {
    period: { from, to },
    accounts: rows.map(r => ({
      code:r.code, name:r.name, type:r.type, category:r.category,
      debit:pf(r.total_debit), credit:pf(r.total_credit),
    })),
    totalDebit, totalCredit,
    balanced: Math.abs(totalDebit - totalCredit) < 0.01,
  }
}

// ─── Deposits (Owner Capital Injections) ──────────────────────────────────

async function ensureDepositsTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS fin_deposits (
      id               SERIAL PRIMARY KEY,
      deposit_number   TEXT UNIQUE NOT NULL,
      deposit_date     DATE NOT NULL DEFAULT CURRENT_DATE,
      amount           NUMERIC(14,3) NOT NULL,
      owner_name       TEXT NOT NULL,
      payment_method   TEXT NOT NULL DEFAULT 'bank',
      description      TEXT,
      debit_account    TEXT NOT NULL,
      credit_account   TEXT NOT NULL,
      journal_entry_id INTEGER REFERENCES fin_journal_entries(id),
      created_by       TEXT,
      created_at       TIMESTAMPTZ DEFAULT NOW()
    )
  `
  await sql`CREATE SEQUENCE IF NOT EXISTS fin_deposit_seq START 1`
}

export async function createDeposit({ depositDate, amount, ownerName, paymentMethod, description, debitAccount, creditAccount, actor } = {}) {
  await ensureDepositsTable()
  const [{ n }] = await sql`SELECT NEXTVAL('fin_deposit_seq')::int AS n`
  const depositNumber = `DEP-${new Date().getFullYear()}-${String(n).padStart(5, '0')}`

  const [dep] = await sql`
    INSERT INTO fin_deposits
      (deposit_number, deposit_date, amount, owner_name, payment_method, description, debit_account, credit_account, created_by)
    VALUES
      (${depositNumber}, ${depositDate || new Date().toISOString().split('T')[0]},
       ${parseFloat(amount)}, ${ownerName}, ${paymentMethod || 'bank'},
       ${description || null}, ${debitAccount}, ${creditAccount}, ${actor || 'admin'})
    RETURNING id
  `

  const entryId = await createOrFindJournalEntry({
    entryDate:   depositDate || new Date().toISOString().split('T')[0],
    description: `إيداع رأس مال — ${ownerName}${description ? ': ' + description : ''}`,
    sourceType:  'deposit',
    sourceId:    dep.id,
    sourceRef:   depositNumber,
    actor:       actor || 'admin',
  })

  await postJournalLines(entryId, [
    { accountCode: debitAccount,  debit: parseFloat(amount), credit: 0,                 description: `Deposit: ${depositNumber}` },
    { accountCode: creditAccount, debit: 0,                  credit: parseFloat(amount), description: `Deposit: ${depositNumber}` },
  ])

  await sql`UPDATE fin_deposits SET journal_entry_id = ${entryId} WHERE id = ${dep.id}`

  await writeFinAudit(actor || 'admin', 'admin', 'create_deposit', 'deposit', dep.id, null,
    { depositNumber, amount, ownerName, debitAccount, creditAccount })

  return { id: dep.id, depositNumber }
}

export async function getDeposits({ page = 1, limit = 20 } = {}) {
  await ensureDepositsTable()
  const offset = (page - 1) * limit
  const [{ total }] = await sql`SELECT COUNT(*)::int AS total FROM fin_deposits`
  const deposits = await sql`
    SELECT d.*, je.entry_number
    FROM fin_deposits d
    LEFT JOIN fin_journal_entries je ON je.id = d.journal_entry_id
    ORDER BY d.deposit_date DESC, d.id DESC
    LIMIT ${limit} OFFSET ${offset}
  `
  return { deposits, total, pages: Math.ceil(total / limit) || 1 }
}
