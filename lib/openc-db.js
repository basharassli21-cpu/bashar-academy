// lib/openc-db.js — OpenC (Open Calls Pool) data layer.
// Shared pool of returned leads any employee (or admin on their behalf) can
// claim. Mirrors lib/sales-db.js's style; reuses createLead from there for
// the claim step instead of duplicating insert logic.

import { neon } from '@neondatabase/serverless'
import { getLeadById, createLead } from './sales-db'

const sql = neon(process.env.DATABASE_URL || process.env.POSTGRES_URL)

export class AlreadyClaimedError extends Error {}

function toDateOnlyString(value) {
  if (!value) return null
  if (typeof value === 'string') return value.split('T')[0]
  const y = value.getFullYear()
  const m = String(value.getMonth() + 1).padStart(2, '0')
  const d = String(value.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function normalizeOpencLead(row) {
  if (!row) return row
  return { ...row, last_contact_date: toDateOnlyString(row.last_contact_date) }
}

// Moves a lead into the shared pool without touching the original `leads`
// row — it stays in the employee's history exactly as the existing
// sequential-lock logic already expects (a not_interested/cancelled lead is
// already "handled", so the lock already advances with no changes there).
export async function returnLeadToOpenC({ leadId, reason, actorRole, actorEmployeeId }) {
  const lead = await getLeadById(leadId)
  if (!lead) return null

  const rows = await sql`
    INSERT INTO openc_leads (customer_name, phone, last_status, reason, last_contact_date, source_lead_id, returned_by_employee_id)
    VALUES (${lead.customer_name}, ${lead.phone}, ${lead.status}, ${reason || null}, ${lead.last_contact_date || null}, ${leadId}, ${actorEmployeeId || null})
    RETURNING *
  `
  const opencLead = rows[0]

  await sql`
    INSERT INTO openc_transfer_logs (openc_lead_id, action, actor_employee_id, actor_role, details)
    VALUES (${opencLead.id}, 'returned', ${actorEmployeeId || null}, ${actorRole}, ${reason || null})
  `

  return normalizeOpencLead(opencLead)
}

export async function getOpenPool() {
  const rows = await sql`SELECT * FROM openc_leads ORDER BY returned_at ASC`
  return rows.map(normalizeOpencLead)
}

// Atomic claim: the conditional UPDATE below is a single Postgres statement,
// so it's inherently race-safe — if two employees claim the same lead at the
// same time, only one UPDATE will match status='open' and return a row.
export async function claimOpenCLead({ opencId, claimingEmployeeId, actorRole, actorEmployeeId }) {
  const claimedRows = await sql`
    UPDATE openc_leads SET status = 'assigned', claimed_by_employee_id = ${claimingEmployeeId}, claimed_at = now()
    WHERE id = ${opencId} AND status = 'open'
    RETURNING *
  `
  if (claimedRows.length === 0) throw new AlreadyClaimedError('هذا العميل تم سحبه بالفعل')

  const opencLead = claimedRows[0]
  const newLead = await createLead({
    employeeId: claimingEmployeeId,
    customerName: opencLead.customer_name,
    phone: opencLead.phone,
  })

  await sql`UPDATE leads SET claimed_from_openc_id = ${opencId} WHERE id = ${newLead.id}`
  await sql`UPDATE openc_leads SET claimed_lead_id = ${newLead.id} WHERE id = ${opencId}`
  await sql`
    INSERT INTO openc_transfer_logs (openc_lead_id, action, actor_employee_id, actor_role, details)
    VALUES (${opencId}, 'claimed', ${actorEmployeeId || null}, ${actorRole}, ${actorRole === 'admin' ? `assigned to employee ${claimingEmployeeId}` : 'self-claimed'})
  `

  return {
    opencLead: normalizeOpencLead({ ...opencLead, claimed_lead_id: newLead.id }),
    newLead: { ...newLead, claimed_from_openc_id: opencId },
  }
}

export async function updateOpenCLead(id, { customerName, phone, reason }) {
  if (customerName !== undefined) await sql`UPDATE openc_leads SET customer_name = ${customerName} WHERE id = ${id}`
  if (phone !== undefined) await sql`UPDATE openc_leads SET phone = ${phone} WHERE id = ${id}`
  if (reason !== undefined) await sql`UPDATE openc_leads SET reason = ${reason} WHERE id = ${id}`
  const rows = await sql`SELECT * FROM openc_leads WHERE id = ${id}`
  return rows[0] ? normalizeOpencLead(rows[0]) : null
}

export async function getOpenCStats() {
  const open = await sql`SELECT COUNT(*)::int AS n FROM openc_leads WHERE status = 'open'`
  const assigned = await sql`SELECT COUNT(*)::int AS n FROM openc_leads WHERE status = 'assigned'`
  const converted = await sql`
    SELECT COUNT(*)::int AS n FROM openc_leads o
    JOIN leads l ON l.id = o.claimed_lead_id
    WHERE l.status = 'closed_sale'
  `
  return { openCount: open[0].n, assignedCount: assigned[0].n, convertedCount: converted[0].n }
}

export async function getOpenCStatsForEmployee(employeeId) {
  const assigned = await sql`SELECT COUNT(*)::int AS n FROM openc_leads WHERE claimed_by_employee_id = ${employeeId}`
  const converted = await sql`
    SELECT COUNT(*)::int AS n FROM openc_leads o
    JOIN leads l ON l.id = o.claimed_lead_id
    WHERE o.claimed_by_employee_id = ${employeeId} AND l.status = 'closed_sale'
  `
  const open = await sql`SELECT COUNT(*)::int AS n FROM openc_leads WHERE status = 'open'`
  return { openCount: open[0].n, claimedByMeCount: assigned[0].n, convertedByMeCount: converted[0].n }
}
