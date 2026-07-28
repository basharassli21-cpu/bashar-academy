// lib/sales-db.js — Sales Management System data layer (Vercel Postgres / Neon)
//
// Employees, leads, lead notes, and call logs live in real relational tables
// (see scripts/migrate-sales-db.js for the schema). This module is the only
// place that talks SQL — API routes call these functions instead.

import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL || process.env.POSTGRES_URL)

const STATUSES = ['new', 'contacted', 'interested', 'not_interested', 'closed_sale', 'cancelled', 'unreachable']

function initialsOf(name) {
  return name.split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('')
}

function lastDayOfCurrentMonth() {
  const now = new Date()
  const y = now.getFullYear(), m = now.getMonth()
  const lastDay = new Date(y, m + 1, 0).getDate()
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`
}

// The driver returns DATE columns as JS Date objects constructed from local
// calendar parts. Reading them back via UTC (e.g. JSON.stringify) shifts the
// calendar day in any non-UTC timezone, so always re-extract with local getters.
function toDateOnlyString(value) {
  if (!value) return null
  if (typeof value === 'string') return value.split('T')[0]
  const y = value.getFullYear()
  const m = String(value.getMonth() + 1).padStart(2, '0')
  const d = String(value.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function normalizeLead(lead) {
  if (!lead) return lead
  return {
    ...lead,
    last_contact_date: toDateOnlyString(lead.last_contact_date),
    next_followup_date: toDateOnlyString(lead.next_followup_date),
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
    INSERT INTO leads (employee_id, sequence, customer_name, phone, status, next_followup_date)
    VALUES (${employeeId}, ${nextSeq}, ${customerName}, ${phone}, 'new', ${lastDayOfCurrentMonth()})
    RETURNING *
  `
  return normalizeLead(rows[0])
}

// Returns leads for an employee, ordered, each annotated with its notes,
// whether it's been handled, and whether it's locked behind an earlier lead.
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

  const annotated = leads.map(lead => {
    const leadNotes = notesByLead.get(lead.id) || []
    return { ...lead, notes: leadNotes, isHandled: lead.status !== 'new' || leadNotes.length > 0 }
  })

  const firstUnhandledIndex = annotated.findIndex(l => !l.isHandled)
  return annotated.map((lead, i) => ({
    ...lead,
    locked: firstUnhandledIndex !== -1 && i > firstUnhandledIndex,
  }))
}

export async function getLeadById(id) {
  const rows = await sql`SELECT * FROM leads WHERE id = ${id} LIMIT 1`
  return rows[0] ? normalizeLead(rows[0]) : null
}

// Applies a status/note/date update to a lead, logs exactly one call, and
// (on first transition into 'closed_sale') stamps closed_at for monthly stats.
export async function updateLead(id, { status, note, lastContactDate, nextFollowupDate }) {
  const current = await getLeadById(id)
  if (!current) return null
  if (status !== undefined && !STATUSES.includes(status)) throw new Error('invalid status')

  const closingNow = status === 'closed_sale' && current.status !== 'closed_sale'
  const statusVal = status || null
  const lastContactVal = lastContactDate || null
  const nextFollowupVal = nextFollowupDate || null

  await sql`
    UPDATE leads SET
      status = COALESCE(${statusVal}, status),
      last_contact_date = COALESCE(${lastContactVal}, last_contact_date),
      next_followup_date = COALESCE(${nextFollowupVal}, next_followup_date),
      closed_at = CASE WHEN ${closingNow} THEN now() ELSE closed_at END,
      updated_at = now()
    WHERE id = ${id}
  `

  if (note && note.trim()) {
    await sql`INSERT INTO lead_notes (lead_id, text) VALUES (${id}, ${note.trim()})`
  }

  await sql`INSERT INTO call_logs (employee_id, lead_id) VALUES (${current.employee_id}, ${id})`

  return await getLeadById(id)
}

// ─── Stats ───────────────────────────────────────────────────────────────

export async function getEmployeeMonthlyStats(employeeId) {
  const { start, end } = monthRange()
  const employee = await getEmployeeById(employeeId)
  const target = employee?.monthly_target || 0

  const closedRows = await sql`
    SELECT COUNT(*)::int AS n FROM leads
    WHERE employee_id = ${employeeId} AND closed_at >= ${start} AND closed_at < ${end}
  `
  const callRows = await sql`
    SELECT COUNT(*)::int AS n FROM call_logs
    WHERE employee_id = ${employeeId} AND created_at >= ${start} AND created_at < ${end}
  `

  const closedSales = closedRows[0].n
  const totalCalls = callRows[0].n
  const targetProgress = target > 0 ? Math.round((closedSales / target) * 100) : 0

  return { closedSales, totalCalls, monthlyTarget: target, targetProgress }
}

// All-employees summary for the admin "Sales Team" tab.
// Single JOIN query — replaces the N+1 pattern (was 1 + N queries, now 1 query).
export async function getAllEmployeesWithStats() {
  const { start, end } = monthRange()
  const rows = await sql`
    SELECT
      e.id, e.username, e.name, e.monthly_target, e.created_at,
      COUNT(DISTINCT CASE WHEN l.status = 'closed_sale' AND l.closed_at >= ${start} AND l.closed_at < ${end} THEN l.id END)::int AS closed_sales,
      COUNT(DISTINCT CASE WHEN cl.created_at >= ${start} AND cl.created_at < ${end} THEN cl.id END)::int AS total_calls
    FROM employees e
    LEFT JOIN leads l ON l.employee_id = e.id
    LEFT JOIN call_logs cl ON cl.employee_id = e.id
    GROUP BY e.id
    ORDER BY e.created_at ASC
  `
  return rows.map(r => ({
    id: r.id, username: r.username, name: r.name,
    monthly_target: r.monthly_target, created_at: r.created_at,
    stats: {
      closedSales: r.closed_sales,
      totalCalls: r.total_calls,
      monthlyTarget: r.monthly_target,
      targetProgress: r.monthly_target > 0 ? Math.round((r.closed_sales / r.monthly_target) * 100) : 0,
    },
  }))
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

export { STATUSES }
