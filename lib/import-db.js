// lib/import-db.js — Import Leads bulk data layer (Vercel Postgres / Neon).
// Server-only: never import this from a browser-bundled file.
//
// Every write here is a bulk operation (unnest()-based multi-row INSERT/UPDATE)
// rather than a per-row loop, so importing thousands of rows costs a small,
// constant number of round trips instead of one (or more) per row.

import { neon } from '@neondatabase/serverless'
import { getAllEmployees } from './sales-db'
import { normalizeStatusValue, lastDayOfCurrentMonth } from './import-mapping'

const sql = neon(process.env.DATABASE_URL || process.env.POSTGRES_URL)

export class NoEmployeesError extends Error {}

function isValidDateString(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
}

function sanitizeRow(row) {
  const phone = String(row.phone || '').trim()
  if (!phone) return null
  const name = String(row.name || '').trim() || phone
  const status = normalizeStatusValue(row.status)
  const note = String(row.note || '').trim() || null
  const lastContactDate = isValidDateString(row.lastContactDate) ? row.lastContactDate : null
  const nextFollowupDate = isValidDateString(row.nextFollowupDate) ? row.nextFollowupDate : lastDayOfCurrentMonth()
  return { name, phone, status, note, lastContactDate, nextFollowupDate }
}

export async function checkExistingPhones(phones) {
  if (phones.length === 0) return new Map()
  const rows = await sql`SELECT id, phone, employee_id FROM leads WHERE phone = ANY(${phones}::text[])`
  return new Map(rows.map(r => [r.phone, { id: r.id, employeeId: r.employee_id }]))
}

// Single-statement bulk insert for one employee's chunk: a CTE reads this
// employee's current max sequence once, and WITH ORDINALITY assigns each
// unnested row a gap-free sequential number in the same statement (one round
// trip, no separate SELECT-then-INSERT race window). The UNIQUE(employee_id,
// sequence) constraint is the real safety net for the rare case of a genuine
// concurrent insert for the same employee — caught here and retried once.
async function bulkInsertLeadsForEmployee(employeeId, rows, attempt = 0) {
  const names = rows.map(r => r.name)
  const phones = rows.map(r => r.phone)
  const statuses = rows.map(r => r.status)
  const lastContactDates = rows.map(r => r.lastContactDate)
  const nextFollowupDates = rows.map(r => r.nextFollowupDate)

  try {
    return await sql`
      WITH base AS (
        SELECT COALESCE(MAX(sequence), 0) AS max_seq FROM leads WHERE employee_id = ${employeeId}
      ),
      input AS (
        SELECT * FROM unnest(${names}::text[], ${phones}::text[], ${statuses}::text[], ${lastContactDates}::date[], ${nextFollowupDates}::date[])
        WITH ORDINALITY AS t(name, phone, status, last_contact_date, next_followup_date, ord)
      )
      INSERT INTO leads (employee_id, sequence, customer_name, phone, status, last_contact_date, next_followup_date)
      SELECT ${employeeId}, base.max_seq + input.ord, input.name, input.phone, input.status, input.last_contact_date, input.next_followup_date
      FROM input, base
      RETURNING id, phone
    `
  } catch (err) {
    if (err.code === '23505' && attempt === 0) {
      return await bulkInsertLeadsForEmployee(employeeId, rows, attempt + 1)
    }
    throw err
  }
}

async function bulkInsertOpenC(rows) {
  const names = rows.map(r => r.name)
  const phones = rows.map(r => r.phone)
  const statuses = rows.map(r => r.status)
  const reasons = rows.map(r => r.note || 'مستورد من ملف خارجي')
  const lastContactDates = rows.map(r => r.lastContactDate)

  await sql`
    INSERT INTO openc_leads (customer_name, phone, last_status, reason, last_contact_date, status)
    SELECT t.name, t.phone, t.status, t.reason, t.last_contact_date, 'open'
    FROM unnest(${names}::text[], ${phones}::text[], ${statuses}::text[], ${reasons}::text[], ${lastContactDates}::date[])
      AS t(name, phone, status, reason, last_contact_date)
  `
}

async function bulkUpdateDuplicates(rows) {
  if (rows.length === 0) return
  const ids = rows.map(r => r.existingId)
  const statuses = rows.map(r => r.status)
  const lastContactDates = rows.map(r => r.lastContactDate)
  const nextFollowupDates = rows.map(r => r.nextFollowupDate)

  await sql`
    UPDATE leads SET
      status = u.status,
      last_contact_date = COALESCE(u.last_contact_date, leads.last_contact_date),
      next_followup_date = COALESCE(u.next_followup_date, leads.next_followup_date),
      updated_at = now(),
      closed_at = CASE WHEN u.status = 'closed_sale' AND leads.status <> 'closed_sale' THEN now() ELSE leads.closed_at END
    FROM (
      SELECT * FROM unnest(${ids}::int[], ${statuses}::text[], ${lastContactDates}::date[], ${nextFollowupDates}::date[])
        AS t(id, status, last_contact_date, next_followup_date)
    ) AS u
    WHERE leads.id = u.id
  `
}

async function bulkInsertNotes(notes) {
  if (notes.length === 0) return
  await sql`
    INSERT INTO lead_notes (lead_id, text)
    SELECT * FROM unnest(${notes.map(n => n.leadId)}::int[], ${notes.map(n => n.text)}::text[])
  `
}

// Validates every row server-side (never trusts the client's mapping/status
// normalization), resolves duplicates by phone, distributes brand-new leads
// per assignmentMode, and logs one lead_imports row. Returns the summary
// counts shown to the admin.
export async function bulkImportLeads({ rows, duplicateStrategy, assignmentMode, employeeId, filename, uploadedBy }) {
  let invalidCount = 0
  const sanitized = []
  for (const row of rows) {
    const clean = sanitizeRow(row)
    if (!clean) { invalidCount++; continue }
    sanitized.push(clean)
  }

  // Dedupe within the batch by phone — last row wins.
  const byPhone = new Map()
  for (const row of sanitized) byPhone.set(row.phone, row)
  const deduped = [...byPhone.values()]

  const existing = await checkExistingPhones(deduped.map(r => r.phone))
  const toUpdate = []
  const toCreate = []
  for (const row of deduped) {
    const match = existing.get(row.phone)
    if (match) toUpdate.push({ ...row, existingId: match.id })
    else toCreate.push(row)
  }

  const notesToInsert = []
  let updatedCount = 0
  let skippedCount = 0

  if (duplicateStrategy === 'ignore') {
    skippedCount = toUpdate.length
  } else {
    await bulkUpdateDuplicates(toUpdate)
    updatedCount = toUpdate.length
    for (const row of toUpdate) {
      if (row.note) notesToInsert.push({ leadId: row.existingId, text: row.note })
    }
  }

  let importedCount = 0
  if (toCreate.length > 0) {
    if (assignmentMode === 'openc') {
      await bulkInsertOpenC(toCreate)
      importedCount = toCreate.length
    } else {
      const chunks = new Map()
      if (assignmentMode === 'employee') {
        chunks.set(employeeId, toCreate)
      } else if (assignmentMode === 'round_robin') {
        const employees = await getAllEmployees()
        if (employees.length === 0) throw new NoEmployeesError('لا يوجد موظفون لتوزيع العملاء عليهم')
        toCreate.forEach((row, i) => {
          const emp = employees[i % employees.length]
          if (!chunks.has(emp.id)) chunks.set(emp.id, [])
          chunks.get(emp.id).push(row)
        })
      }

      for (const [empId, empRows] of chunks) {
        const inserted = await bulkInsertLeadsForEmployee(empId, empRows)
        const phoneToId = new Map(inserted.map(l => [l.phone, l.id]))
        for (const row of empRows) {
          if (row.note) {
            const leadId = phoneToId.get(row.phone)
            if (leadId) notesToInsert.push({ leadId, text: row.note })
          }
        }
        importedCount += empRows.length
      }
    }
  }

  await bulkInsertNotes(notesToInsert)

  await sql`
    INSERT INTO lead_imports (filename, uploaded_by, total_rows, imported_count, updated_count, skipped_count, invalid_count, assignment_mode, assigned_employee_id)
    VALUES (${filename}, ${uploadedBy}, ${rows.length}, ${importedCount}, ${updatedCount}, ${skippedCount}, ${invalidCount}, ${assignmentMode}, ${assignmentMode === 'employee' ? employeeId : null})
  `

  return { imported: importedCount, updated: updatedCount, skipped: skippedCount, invalid: invalidCount }
}

export async function getImportHistory() {
  return await sql`SELECT * FROM lead_imports ORDER BY created_at DESC`
}
