// lib/sales-db.js — Sales Management System data layer (Vercel Postgres / Neon)
//
// Employees, leads, lead notes, and call logs live in real relational tables
// (see scripts/migrate-sales-db.js for the schema). This module is the only
// place that talks SQL — API routes call these functions instead.

import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL || process.env.POSTGRES_URL)

const STATUSES = ['new', 'contacted', 'interested', 'not_interested', 'closed_sale', 'cancelled', 'unreachable']
const NOTE_TYPES = ['call', 'whatsapp', 'meeting', 'note']
const CALL_STATUSES = ['answered', 'no_answer', 'busy', 'failed']
const CONTACT_NOTE_TYPES = ['call', 'whatsapp', 'meeting']

function initialsOf(name) {
  return name.split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('')
}

// Follow-up days are calendar days in Jordan, not on the (UTC) server.
export function todayInJordan() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Amman' }).format(new Date())
}

// The driver returns DATE columns as JS Date objects constructed from local
// calendar parts. Reading them back via UTC (e.g. JSON.stringify) shifts the
// calendar day in any non-UTC timezone, so always re-extract with local getters.
export function toDateOnlyString(value) {
  if (!value) return null
  if (typeof value === 'string') return value.split('T')[0]
  const y = value.getFullYear()
  const m = String(value.getMonth() + 1).padStart(2, '0')
  const d = String(value.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// A lead claimed from the OpenC pool is an "openc" lead; anything else was
// uploaded for its employee and is "fresh".
export function leadSource(lead) {
  return lead.claimed_from_openc_id ? 'openc' : 'fresh'
}

export function normalizeLead(lead) {
  if (!lead) return lead
  return {
    ...lead,
    last_contact_date: toDateOnlyString(lead.last_contact_date),
    next_followup_date: toDateOnlyString(lead.next_followup_date),
    source: leadSource(lead),
  }
}

function monthRange(date = new Date()) {
  const start = new Date(date.getFullYear(), date.getMonth(), 1)
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 1)
  return { start: start.toISOString(), end: end.toISOString() }
}

// ─── Employees ───────────────────────────────────────────────────────────

export async function createEmployee({ username, passwordHash, name, monthlyTarget }) {
  const rows = await sql`
    INSERT INTO employees (username, password_hash, name, monthly_target)
    VALUES (${username}, ${passwordHash}, ${name}, ${monthlyTarget || 0})
    RETURNING id, username, name, monthly_target, created_at
  `
  return rows[0]
}

export async function getEmployeeByUsername(username) {
  const rows = await sql`SELECT * FROM employees WHERE username = ${username} LIMIT 1`
  return rows[0] || null
}

export async function getEmployeeById(id) {
  const rows = await sql`SELECT * FROM employees WHERE id = ${id} LIMIT 1`
  return rows[0] || null
}

export async function getAllEmployees() {
  return await sql`SELECT id, username, name, monthly_target, created_at FROM employees ORDER BY created_at ASC`
}

export async function updateEmployee(id, { name, monthlyTarget, passwordHash }) {
  if (name !== undefined) await sql`UPDATE employees SET name = ${name} WHERE id = ${id}`
  if (monthlyTarget !== undefined) await sql`UPDATE employees SET monthly_target = ${monthlyTarget} WHERE id = ${id}`
  if (passwordHash !== undefined) await sql`UPDATE employees SET password_hash = ${passwordHash} WHERE id = ${id}`
  return await getEmployeeById(id)
}

export async function deleteEmployee(id) {
  await sql`DELETE FROM employees WHERE id = ${id}`
}

export function employeeAvatar(name) {
  return initialsOf(name)
}

// ─── Leads ───────────────────────────────────────────────────────────────

export async function createLead({ employeeId, customerName, phone }) {
  const seqRows = await sql`SELECT COALESCE(MAX(sequence), 0) + 1 AS next_seq FROM leads WHERE employee_id = ${employeeId}`
  const nextSeq = seqRows[0].next_seq
  const rows = await sql`
    INSERT INTO leads (employee_id, sequence, customer_name, phone, status)
    VALUES (${employeeId}, ${nextSeq}, ${customerName}, ${phone}, 'new')
    RETURNING *
  `
  return normalizeLead(rows[0])
}

// Returns leads for an employee, ordered, each annotated with its notes.
export async function getLeadsForEmployee(employeeId) {
  const rawLeads = await sql`SELECT * FROM leads WHERE employee_id = ${employeeId} ORDER BY sequence ASC`
  if (rawLeads.length === 0) return []
  const leads = rawLeads.map(normalizeLead)

  const leadIds = leads.map(l => l.id)
  const notes = await sql`SELECT * FROM lead_notes WHERE lead_id = ANY(${leadIds}) ORDER BY created_at ASC`
  const notesByLead = new Map()
  for (const n of notes) {
    if (!notesByLead.has(n.lead_id)) notesByLead.set(n.lead_id, [])
    notesByLead.get(n.lead_id).push(n)
  }

  return leads.map(lead => ({ ...lead, notes: notesByLead.get(lead.id) || [] }))
}

export async function getLeadById(id) {
  const rows = await sql`SELECT * FROM leads WHERE id = ${id} LIMIT 1`
  return rows[0] ? normalizeLead(rows[0]) : null
}

export async function getLeadForEmployee(id, employeeId) {
  const rows = await sql`SELECT * FROM leads WHERE id = ${id} AND employee_id = ${employeeId} LIMIT 1`
  return rows[0] ? normalizeLead(rows[0]) : null
}

// Logs one activity on a lead: applies the status / follow-up change, adds the
// timeline entry and exactly one call log, and (on first transition into
// 'closed_sale') stamps closed_at for monthly stats.
// nextFollowupDate: undefined leaves the date alone, null clears it.
export async function updateLead(id, { status, note, noteType, callStatus, durationMinutes, nextFollowupDate }) {
  const current = await getLeadById(id)
  if (!current) return null
  if (status !== undefined && !STATUSES.includes(status)) throw new Error('invalid status')

  const closingNow = status === 'closed_sale' && current.status !== 'closed_sale'
  const type = noteType || 'note'
  const contacted = CONTACT_NOTE_TYPES.includes(type)
  const setFollowup = nextFollowupDate !== undefined

  await sql`
    UPDATE leads SET
      status = COALESCE(${status || null}, status),
      last_contact_date = CASE WHEN ${contacted} THEN ${todayInJordan()}::date ELSE last_contact_date END,
      next_followup_date = CASE WHEN ${setFollowup} THEN ${nextFollowupDate || null}::date ELSE next_followup_date END,
      closed_at = CASE WHEN ${closingNow} THEN now() ELSE closed_at END,
      updated_at = now()
    WHERE id = ${id}
  `

  const text = (note || '').trim()
  if (text || contacted) {
    await sql`
      INSERT INTO lead_notes (lead_id, text, note_type, call_status, duration_minutes, status_at_time)
      VALUES (${id}, ${text}, ${type}, ${type === 'call' ? callStatus || null : null}, ${durationMinutes ?? null}, ${status || current.status})
    `
  }

  await sql`INSERT INTO call_logs (employee_id, lead_id) VALUES (${current.employee_id}, ${id})`

  return await getLeadById(id)
}

// ─── Stats ───────────────────────────────────────────────────────────────

export async function getEmployeeMonthlyStats(employeeId) {
  const { start, end } = monthRange()
  const now = new Date()
  const y = now.getFullYear(), m = now.getMonth() + 1
  const employee = await getEmployeeById(employeeId)
  const target = employee?.monthly_target || 0

  const [revRows, callRows] = await Promise.all([
    sql`SELECT COALESCE(SUM(amount_paid),0)::numeric AS rev FROM sale_records
        WHERE employee_id = ${employeeId}
          AND EXTRACT(YEAR FROM sale_date) = ${y} AND EXTRACT(MONTH FROM sale_date) = ${m}
          AND sale_status != 'cancelled'`,
    sql`SELECT COUNT(*)::int AS n FROM call_logs
        WHERE employee_id = ${employeeId} AND created_at >= ${start} AND created_at < ${end}`,
  ])

  const revenueThisMonth = parseFloat(revRows[0].rev) || 0
  const totalCalls = callRows[0].n
  const targetProgress = target > 0 ? Math.min(Math.round((revenueThisMonth / target) * 100), 100) : 0

  return { revenueThisMonth, totalCalls, monthlyTarget: target, targetProgress }
}

// All-employees summary for the admin "Sales Team" tab.
export async function getAllEmployeesWithStats() {
  const { start, end } = monthRange()
  const now = new Date()
  const y = now.getFullYear(), m = now.getMonth() + 1
  const rows = await sql`
    SELECT
      e.id, e.username, e.name, e.monthly_target, e.created_at,
      COALESCE(SUM(sr.amount_paid) FILTER (
        WHERE EXTRACT(YEAR FROM sr.sale_date) = ${y}
          AND EXTRACT(MONTH FROM sr.sale_date) = ${m}
          AND sr.sale_status != 'cancelled'
      ), 0)::numeric AS revenue_month,
      COUNT(DISTINCT CASE WHEN cl.created_at >= ${start} AND cl.created_at < ${end} THEN cl.id END)::int AS total_calls
    FROM employees e
    LEFT JOIN sale_records sr ON sr.employee_id = e.id
    LEFT JOIN call_logs cl ON cl.employee_id = e.id
    GROUP BY e.id
    ORDER BY e.created_at ASC
  `
  return rows.map(r => {
    const rev = parseFloat(r.revenue_month) || 0
    const tgt = r.monthly_target || 0
    return {
      id: r.id, username: r.username, name: r.name,
      monthly_target: tgt, created_at: r.created_at,
      stats: {
        revenueThisMonth: rev,
        totalCalls: r.total_calls,
        monthlyTarget: tgt,
        targetProgress: tgt > 0 ? Math.min(Math.round((rev / tgt) * 100), 100) : 0,
      },
    }
  })
}

// ─── Account lockout ──────────────────────────────────────────────────────

export async function incrementLoginFailures(employeeId) {
  try {
    await sql`
      UPDATE employees
      SET
        failed_attempts = COALESCE(failed_attempts, 0) + 1,
        locked_until = CASE
          WHEN COALESCE(failed_attempts, 0) + 1 >= 5
          THEN NOW() + INTERVAL '15 minutes'
          ELSE locked_until
        END
      WHERE id = ${employeeId}
    `
  } catch { /* columns may not exist yet — run migrate-improvements.js */ }
}

export async function resetLoginFailures(employeeId) {
  try {
    await sql`UPDATE employees SET failed_attempts = 0, locked_until = NULL WHERE id = ${employeeId}`
  } catch { /* columns may not exist yet */ }
}

export async function getEmployeeLockStatus(employeeId) {
  try {
    const rows = await sql`
      SELECT failed_attempts, locked_until FROM employees WHERE id = ${employeeId} LIMIT 1
    `
    if (!rows[0]) return { locked: false }
    const { locked_until } = rows[0]
    if (locked_until && new Date(locked_until) > new Date()) {
      return { locked: true, lockedUntil: locked_until }
    }
    return { locked: false }
  } catch {
    return { locked: false }
  }
}

export { STATUSES, NOTE_TYPES, CALL_STATUSES }

// ─── Phone normalization ──────────────────────────────────────────────────
// Supports: +962XXXXXXXXX | 00962XXXXXXXXX | 962XXXXXXXXX | 0XXXXXXXXX
// Output: 0XXXXXXXXX (10 digits, starts with 077/078/079)
export function normalizeJordanPhone(raw) {
  if (!raw) return null
  let digits = String(raw).replace(/[\s\-().+]/g, '')
  if (digits.startsWith('00962')) digits = digits.slice(5)
  else if (digits.startsWith('962')) digits = digits.slice(3)
  if (!digits.startsWith('0')) digits = '0' + digits
  if (!/^0(77|78|79)\d{7}$/.test(digits)) return null
  return digits
}

// ─── Sale Records ─────────────────────────────────────────────────────────

// The amount a sale stands for. Money is sometimes entered only as a deposit;
// that deposit is then the sale's amount, because every revenue figure and the
// finance entry read amount_paid and would otherwise count the sale as zero.
export function resolveSaleAmounts({ amountPaid, deposit }) {
  const positive = (value) => {
    const n = parseFloat(value)
    return Number.isFinite(n) && n > 0 ? n : null
  }
  const dep = positive(deposit)
  return { amountPaid: positive(amountPaid) ?? dep, deposit: dep }
}

export async function createSaleRecord({
  employeeId, studentName, studentPhone, packageName, notes, proofImageUrl,
  studentUsername, studentAccountCreated, studentAccountExisting,
  amountPaid, deposit, paymentMethod, saleStatus, approvalStatus,
}) {
  const normalized = normalizeJordanPhone(studentPhone)
  if (!normalized) throw new Error('رقم الهاتف غير صالح — يجب أن يبدأ بـ 077 أو 078 أو 079')

  const rows = await sql`
    INSERT INTO sale_records (
      employee_id, student_name, student_phone, student_phone_normalized,
      package_name, notes, proof_image_url,
      student_username, student_account_created, student_account_existing,
      amount_paid, deposit, payment_method, sale_status, approval_status
    ) VALUES (
      ${employeeId}, ${studentName.trim()}, ${studentPhone.trim()}, ${normalized},
      ${packageName}, ${notes || null}, ${proofImageUrl || null},
      ${studentUsername || null}, ${studentAccountCreated || false}, ${studentAccountExisting || false},
      ${amountPaid || null}, ${deposit || null}, ${paymentMethod || 'bank_transfer'}, ${saleStatus || 'paid'},
      ${approvalStatus || 'approved'}
    )
    RETURNING *
  `
  return rows[0]
}

export async function approveSaleRecord(id, { studentUsername, studentAccountCreated, studentAccountExisting }) {
  const rows = await sql`
    UPDATE sale_records
    SET approval_status = 'approved',
        student_username = ${studentUsername || null},
        student_account_created = ${studentAccountCreated || false},
        student_account_existing = ${studentAccountExisting || false}
    WHERE id = ${id}
    RETURNING *
  `
  return rows[0]
}

export async function rejectSaleRecord(id) {
  const rows = await sql`
    UPDATE sale_records SET approval_status = 'rejected' WHERE id = ${id} RETURNING *
  `
  return rows[0]
}

export async function getPendingSaleRecords() {
  return await sql`
    SELECT sr.*, e.name AS employee_name, e.username AS employee_username
    FROM sale_records sr JOIN employees e ON e.id = sr.employee_id
    WHERE sr.approval_status = 'pending'
    ORDER BY sr.created_at ASC
  `
}

export async function updateSaleRecordStudent(id, { studentUsername, studentAccountCreated, studentAccountExisting }) {
  await sql`
    UPDATE sale_records
    SET student_username = ${studentUsername}, student_account_created = ${studentAccountCreated},
        student_account_existing = ${studentAccountExisting}
    WHERE id = ${id}
  `
}

export async function getSaleRecords({ employeeId, year, month, page = 1, limit = 50 } = {}) {
  const offset = (page - 1) * limit
  const y = year ? parseInt(year) : null
  const m = month ? parseInt(month) : null
  const eid = employeeId ? parseInt(employeeId) : null

  // Build four permutations to avoid dynamic fragment composition issues
  let rows, countRows
  if (eid && y && m) {
    rows = await sql`
      SELECT sr.*, e.name AS employee_name, e.username AS employee_username
      FROM sale_records sr JOIN employees e ON e.id = sr.employee_id
      WHERE sr.employee_id = ${eid}
        AND EXTRACT(YEAR FROM sr.sale_date) = ${y}
        AND EXTRACT(MONTH FROM sr.sale_date) = ${m}
      ORDER BY sr.created_at DESC LIMIT ${limit} OFFSET ${offset}`
    countRows = await sql`
      SELECT COUNT(*)::int AS n FROM sale_records sr
      WHERE sr.employee_id = ${eid}
        AND EXTRACT(YEAR FROM sr.sale_date) = ${y}
        AND EXTRACT(MONTH FROM sr.sale_date) = ${m}`
  } else if (eid) {
    rows = await sql`
      SELECT sr.*, e.name AS employee_name, e.username AS employee_username
      FROM sale_records sr JOIN employees e ON e.id = sr.employee_id
      WHERE sr.employee_id = ${eid}
      ORDER BY sr.created_at DESC LIMIT ${limit} OFFSET ${offset}`
    countRows = await sql`SELECT COUNT(*)::int AS n FROM sale_records sr WHERE sr.employee_id = ${eid}`
  } else if (y && m) {
    rows = await sql`
      SELECT sr.*, e.name AS employee_name, e.username AS employee_username
      FROM sale_records sr JOIN employees e ON e.id = sr.employee_id
      WHERE EXTRACT(YEAR FROM sr.sale_date) = ${y}
        AND EXTRACT(MONTH FROM sr.sale_date) = ${m}
      ORDER BY sr.created_at DESC LIMIT ${limit} OFFSET ${offset}`
    countRows = await sql`
      SELECT COUNT(*)::int AS n FROM sale_records sr
      WHERE EXTRACT(YEAR FROM sr.sale_date) = ${y}
        AND EXTRACT(MONTH FROM sr.sale_date) = ${m}`
  } else {
    rows = await sql`
      SELECT sr.*, e.name AS employee_name, e.username AS employee_username
      FROM sale_records sr JOIN employees e ON e.id = sr.employee_id
      ORDER BY sr.created_at DESC LIMIT ${limit} OFFSET ${offset}`
    countRows = await sql`SELECT COUNT(*)::int AS n FROM sale_records sr`
  }

  return { records: rows, total: countRows[0].n, page, limit }
}

export async function getSaleRecordById(id) {
  const rows = await sql`
    SELECT sr.*, e.name AS employee_name, e.username AS employee_username
    FROM sale_records sr
    JOIN employees e ON e.id = sr.employee_id
    WHERE sr.id = ${id}
  `
  return rows[0] || null
}

export async function getSaleRecordByDuplicate(employeeId, phoneNormalized, saleDate) {
  const rows = await sql`
    SELECT * FROM sale_records
    WHERE employee_id = ${employeeId}
      AND student_phone_normalized = ${phoneNormalized}
      AND sale_date = ${saleDate}
    LIMIT 1
  `
  return rows[0] || null
}

export async function getSaleStats(employeeId, year, month) {
  const y = year || new Date().getFullYear()
  const m = month || (new Date().getMonth() + 1)
  const rows = await sql`
    SELECT COUNT(*)::int AS n
    FROM sale_records
    WHERE employee_id = ${employeeId}
      AND EXTRACT(YEAR FROM sale_date) = ${y}
      AND EXTRACT(MONTH FROM sale_date) = ${m}
  `
  return { count: rows[0].n, year: y, month: m }
}

export async function getAllEmployeesSaleStats(year, month) {
  const y = year || new Date().getFullYear()
  const m = month || (new Date().getMonth() + 1)
  const rows = await sql`
    SELECT e.id, e.name, e.username, COUNT(sr.id)::int AS sale_count
    FROM employees e
    LEFT JOIN sale_records sr ON sr.employee_id = e.id
      AND EXTRACT(YEAR FROM sr.sale_date) = ${y}
      AND EXTRACT(MONTH FROM sr.sale_date) = ${m}
    GROUP BY e.id, e.name, e.username
    ORDER BY sale_count DESC, e.name ASC
  `
  return rows
}

// ─── Full dashboard stats for employee home page ───────────────────────────
export async function getDashboardStats(employeeId) {
  const now = new Date()
  const today = now.toISOString().split('T')[0]
  const y = now.getFullYear()
  const m = now.getMonth() + 1
  const monthStart = `${y}-${String(m).padStart(2,'0')}-01`
  const monthEnd   = new Date(y, m, 1).toISOString()
  const yearStart  = `${y}-01-01`

  const [
    freshRow, callsTodayRow, callsMonthRow,
    salesTodayRow, salesMonthRow, salesYearRow,
    revTodayRow, revMonthRow, revYearRow,
    totalLeadsRow, closedLeadsRow,
    dueTodayRows, recentCallRows, recentSaleRows,
  ] = await Promise.all([
    // Fresh leads (new, not yet contacted)
    sql`SELECT COUNT(*)::int AS n FROM leads WHERE employee_id = ${employeeId} AND status = 'new'`,
    // Calls today
    sql`SELECT COUNT(*)::int AS n FROM call_logs WHERE employee_id = ${employeeId} AND DATE(created_at) = ${today}`,
    // Calls this month
    sql`SELECT COUNT(*)::int AS n FROM call_logs WHERE employee_id = ${employeeId} AND created_at >= ${monthStart} AND created_at < ${monthEnd}`,
    // Sales today (from sale_records)
    sql`SELECT COUNT(*)::int AS n FROM sale_records WHERE employee_id = ${employeeId} AND sale_date = ${today}`,
    // Sales this month
    sql`SELECT COUNT(*)::int AS n FROM sale_records WHERE employee_id = ${employeeId} AND EXTRACT(YEAR FROM sale_date) = ${y} AND EXTRACT(MONTH FROM sale_date) = ${m}`,
    // Sales this year
    sql`SELECT COUNT(*)::int AS n FROM sale_records WHERE employee_id = ${employeeId} AND EXTRACT(YEAR FROM sale_date) = ${y}`,
    // Revenue today
    sql`SELECT COALESCE(SUM(amount_paid), 0)::numeric AS rev FROM sale_records WHERE employee_id = ${employeeId} AND sale_date = ${today} AND sale_status != 'cancelled'`,
    // Revenue this month
    sql`SELECT COALESCE(SUM(amount_paid), 0)::numeric AS rev FROM sale_records WHERE employee_id = ${employeeId} AND EXTRACT(YEAR FROM sale_date) = ${y} AND EXTRACT(MONTH FROM sale_date) = ${m} AND sale_status != 'cancelled'`,
    // Revenue this year
    sql`SELECT COALESCE(SUM(amount_paid), 0)::numeric AS rev FROM sale_records WHERE employee_id = ${employeeId} AND EXTRACT(YEAR FROM sale_date) = ${y} AND sale_status != 'cancelled'`,
    // Total leads (for conversion rate)
    sql`SELECT COUNT(*)::int AS n FROM leads WHERE employee_id = ${employeeId}`,
    // Closed leads
    sql`SELECT COUNT(*)::int AS n FROM leads WHERE employee_id = ${employeeId} AND status = 'closed_sale'`,
    // Due today (follow-ups)
    sql`SELECT id, customer_name, phone, status, next_followup_date, claimed_from_openc_id FROM leads WHERE employee_id = ${employeeId} AND next_followup_date <= ${todayInJordan()}::date AND status NOT IN ('closed_sale','cancelled','not_interested') ORDER BY next_followup_date ASC LIMIT 20`,
    // Recent calls (last 10 call_logs with lead name)
    sql`SELECT cl.id, cl.created_at, l.customer_name, l.id AS lead_id FROM call_logs cl LEFT JOIN leads l ON l.id = cl.lead_id WHERE cl.employee_id = ${employeeId} ORDER BY cl.created_at DESC LIMIT 10`,
    // Recent sales (last 10)
    sql`SELECT id, student_name, student_phone, package_name, amount_paid, sale_date, sale_status FROM sale_records WHERE employee_id = ${employeeId} ORDER BY created_at DESC LIMIT 10`,
  ])

  const totalLeads  = totalLeadsRow[0].n
  const closedLeads = closedLeadsRow[0].n
  const callsMonth  = callsMonthRow[0].n
  const salesMonth  = salesMonthRow[0].n

  return {
    freshLeads:      freshRow[0].n,
    callsToday:      callsTodayRow[0].n,
    callsThisMonth:  callsMonth,
    salesToday:      salesTodayRow[0].n,
    salesThisMonth:  salesMonth,
    salesThisYear:   salesYearRow[0].n,
    revenueToday:    parseFloat(revTodayRow[0].rev) || 0,
    revenueThisMonth: parseFloat(revMonthRow[0].rev) || 0,
    revenueThisYear:  parseFloat(revYearRow[0].rev) || 0,
    conversionRate:  totalLeads > 0 ? ((closedLeads / totalLeads) * 100).toFixed(1) : '0.0',
    closingRate:     callsMonth > 0 ? ((salesMonth / callsMonth) * 100).toFixed(1) : '0.0',
    dueToday:        dueTodayRows.map(normalizeLead),
    recentCalls:     recentCallRows,
    recentSales:     recentSaleRows,
  }
}

// Update a sale record — all editable fields.
// employeeId: pass the employee's id to restrict to their own records; null/0 for admin (no restriction).
export async function updateSaleRecord(id, employeeId, updates) {
  const {
    studentName, studentPhone, packageName, notes, proofImageUrl,
    saleStatus, amountPaid, deposit, paymentMethod,
  } = updates

  const paid    = amountPaid !== undefined && amountPaid !== '' ? parseFloat(amountPaid) : null
  const dep     = deposit    !== undefined && deposit    !== '' ? parseFloat(deposit)    : null
  const eid     = employeeId ? parseInt(employeeId) : null

  const updated = await sql`
    UPDATE sale_records SET
      student_name    = ${studentName},
      student_phone   = ${studentPhone},
      package_name    = ${packageName},
      notes           = ${notes || null},
      proof_image_url = ${proofImageUrl},
      sale_status     = ${saleStatus},
      amount_paid     = ${paid},
      deposit         = ${dep},
      payment_method  = ${paymentMethod}
    WHERE id = ${id} ${eid ? sql`AND employee_id = ${eid}` : sql``}
    RETURNING id
  `
  if (updated.length === 0) return null

  const rows = await sql`SELECT sr.*, e.name AS employee_name FROM sale_records sr JOIN employees e ON e.id = sr.employee_id WHERE sr.id = ${id} LIMIT 1`
  return rows[0] || null
}

// One page of an employee's leads for a tab of the Leads / My Open pages.
// source: 'fresh' = uploaded leads, 'openc' = claimed from the OpenC pool,
// anything else = both.
// A lead whose follow-up date is still ahead is "parked": it stays out of the
// fresh / all lists until that day, when it shows up in the follow-ups tab.
// Searching looks through parked leads too, so one can still be found early.
export async function getLeadsPageData(employeeId, { source, tab = 'all', q = '', page = 1, limit = 30 } = {}) {
  const offset = (page - 1) * limit
  const today = todayInJordan()
  const like = `%${q}%`

  const bySource = source === 'openc' ? sql`AND claimed_from_openc_id IS NOT NULL`
    : source === 'fresh' ? sql`AND claimed_from_openc_id IS NULL`
    : sql``
  const bySearch = q ? sql`AND (customer_name ILIKE ${like} OR phone ILIKE ${like})` : sql``
  const notParked = q ? sql``
    : sql`AND (next_followup_date IS NULL OR next_followup_date <= ${today}::date OR status IN ('closed_sale','cancelled','not_interested'))`
  const byTab = tab === 'followups' ? sql`AND next_followup_date <= ${today}::date AND status NOT IN ('closed_sale','cancelled','not_interested')`
    : tab === 'fresh' ? sql`AND status = 'new' ${notParked}`
    : notParked
  const order = tab === 'followups' ? sql`next_followup_date ASC, id ASC`
    : source === 'openc' ? sql`created_at DESC, id DESC`
    : sql`sequence ASC`

  const where = sql`WHERE employee_id = ${employeeId} ${bySource} ${byTab} ${bySearch}`
  const [rows, countRows] = await Promise.all([
    sql`SELECT * FROM leads ${where} ORDER BY ${order} LIMIT ${limit} OFFSET ${offset}`,
    sql`SELECT COUNT(*)::int AS n FROM leads ${where}`,
  ])

  return {
    leads: rows.map(normalizeLead),
    total: countRows[0].n,
    page,
    limit,
    today,
  }
}

// What each of the employee's lists currently holds, per lead source — drives
// the sidebar and tab badges. fresh = uncontacted, due = follow-up day reached,
// parked = waiting for a follow-up day still ahead.
export async function getLeadCounts(employeeId) {
  const today = todayInJordan()
  const rows = await sql`
    SELECT
      (claimed_from_openc_id IS NOT NULL) AS from_openc,
      COUNT(*) FILTER (WHERE status = 'new' AND (next_followup_date IS NULL OR next_followup_date <= ${today}::date))::int AS fresh,
      COUNT(*) FILTER (WHERE next_followup_date <= ${today}::date AND status NOT IN ('closed_sale','cancelled','not_interested'))::int AS due,
      COUNT(*) FILTER (WHERE next_followup_date > ${today}::date AND status NOT IN ('closed_sale','cancelled','not_interested'))::int AS parked
    FROM leads WHERE employee_id = ${employeeId}
    GROUP BY 1
  `
  const forSource = fromOpenc => {
    const row = rows.find(r => r.from_openc === fromOpenc)
    return { fresh: row?.fresh || 0, due: row?.due || 0, parked: row?.parked || 0 }
  }
  return { fresh: forSource(false), openc: forSource(true) }
}

// Get full lead detail with notes for the side panel
export async function getLeadWithNotes(id, employeeId) {
  const rows = await sql`SELECT * FROM leads WHERE id = ${id} AND employee_id = ${employeeId} LIMIT 1`
  if (!rows[0]) return null
  const lead = normalizeLead(rows[0])
  const notes = await sql`SELECT ln.*, e.name AS employee_name FROM lead_notes ln LEFT JOIN employees e ON e.id = (SELECT employee_id FROM leads WHERE id = ln.lead_id) WHERE ln.lead_id = ${id} ORDER BY ln.created_at DESC LIMIT 50`
  return { ...lead, notes }
}
