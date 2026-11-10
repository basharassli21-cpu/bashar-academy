import { requireAuth } from '../../../../lib/auth'
import { normalizeLead } from '../../../../lib/sales-db'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL || process.env.POSTGRES_URL)

async function handler(req, res) {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'غير مسموح' })
  const id = parseInt(req.query.id)
  if (!id) return res.status(400).json({ error: 'id مطلوب' })

  // ── GET: full lead detail with notes ──────────────────────────────────
  if (req.method === 'GET') {
    const [leadRows, notes] = await Promise.all([
      sql`
        SELECT l.*, e.name AS employee_name, e.id AS employee_id
        FROM leads l LEFT JOIN employees e ON e.id = l.employee_id
        WHERE l.id = ${id} LIMIT 1
      `,
      sql`
        SELECT ln.*, e.name AS author_name
        FROM lead_notes ln
        LEFT JOIN employees e ON e.id = (SELECT employee_id FROM leads WHERE id = ln.lead_id)
        WHERE ln.lead_id = ${id}
        ORDER BY ln.created_at DESC LIMIT 50
      `,
    ])
    if (!leadRows[0]) return res.status(404).json({ error: 'العميل غير موجود' })
    return res.status(200).json({ lead: { ...normalizeLead(leadRows[0]), notes } })
  }

  // ── PATCH: update status / assign employee / add note ─────────────────
  if (req.method === 'PATCH') {
    const { status, assignEmployeeId, note, noteType, nextFollowupDate, lastContactDate } = req.body || {}

    if (status) await sql`UPDATE leads SET status = ${status}, updated_at = now() WHERE id = ${id}`

    if (assignEmployeeId !== undefined) {
      const eid = assignEmployeeId ? parseInt(assignEmployeeId) : null
      await sql`UPDATE leads SET employee_id = ${eid}, updated_at = now() WHERE id = ${id}`
    }

    if (lastContactDate) await sql`UPDATE leads SET last_contact_date = ${lastContactDate}, updated_at = now() WHERE id = ${id}`
    if (nextFollowupDate !== undefined) await sql`UPDATE leads SET next_followup_date = ${nextFollowupDate || null}, updated_at = now() WHERE id = ${id}`

    if (note?.trim()) {
      const nt = noteType || 'note'
      await sql`INSERT INTO lead_notes (lead_id, text, note_type) VALUES (${id}, ${note.trim()}, ${nt})`
    }

    const [leadRows, notes] = await Promise.all([
      sql`SELECT l.*, e.name AS employee_name FROM leads l LEFT JOIN employees e ON e.id = l.employee_id WHERE l.id = ${id} LIMIT 1`,
      sql`SELECT ln.* FROM lead_notes ln WHERE ln.lead_id = ${id} ORDER BY ln.created_at DESC LIMIT 50`,
    ])
    return res.status(200).json({ lead: { ...normalizeLead(leadRows[0]), notes } })
  }

  // ── DELETE ────────────────────────────────────────────────────────────
  if (req.method === 'DELETE') {
    await sql`DELETE FROM lead_notes WHERE lead_id = ${id}`
    await sql`DELETE FROM leads WHERE id = ${id}`
    return res.status(200).json({ ok: true })
  }

  return res.status(405).end()
}

export default requireAuth(handler, 'admin')
