import { requireAuth } from '../../../../lib/auth'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL || process.env.POSTGRES_URL)

async function handler(req, res) {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'غير مسموح' })
  if (req.method !== 'POST') return res.status(405).end()

  const { fromEmployeeId, toEmployeeId, status, leadIds } = req.body || {}

  if (!toEmployeeId)
    return res.status(400).json({ error: 'يجب تحديد الموظف الهدف' })

  try {
    const toId = parseInt(toEmployeeId)

    // ── Mode A: specific lead IDs ──────────────────────────────────────────
    if (Array.isArray(leadIds) && leadIds.length > 0) {
      const ids = leadIds.map(Number).filter(Boolean)
      if (!ids.length) return res.status(400).json({ error: 'لا توجد ليدز محددة' })

      const [maxRow] = await sql`SELECT COALESCE(MAX(sequence),0)::int AS mx FROM leads WHERE employee_id = ${toId}`
      let nextSeq = maxRow.mx + 1

      for (const id of ids) {
        await sql`UPDATE leads SET employee_id = ${toId}, sequence = ${nextSeq}, updated_at = now() WHERE id = ${id}`
        nextSeq++
      }
      return res.status(200).json({ transferred: ids.length })
    }

    // ── Mode B: bulk by source employee (existing behaviour) ───────────────
    if (!fromEmployeeId) return res.status(400).json({ error: 'يجب تحديد الموظف المصدر' })

    const fromId = parseInt(fromEmployeeId)
    if (fromId === toId) return res.status(400).json({ error: 'الموظف المصدر والهدف متطابقان' })

    const leads = status
      ? await sql`SELECT id FROM leads WHERE employee_id = ${fromId} AND status = ${status} ORDER BY sequence ASC`
      : await sql`SELECT id FROM leads WHERE employee_id = ${fromId} ORDER BY sequence ASC`

    if (!leads.length) return res.status(200).json({ transferred: 0 })

    const [maxRow] = await sql`SELECT COALESCE(MAX(sequence),0)::int AS mx FROM leads WHERE employee_id = ${toId}`
    let nextSeq = maxRow.mx + 1

    for (const lead of leads) {
      await sql`UPDATE leads SET employee_id = ${toId}, sequence = ${nextSeq}, updated_at = now() WHERE id = ${lead.id}`
      nextSeq++
    }
    return res.status(200).json({ transferred: leads.length })

  } catch (e) {
    console.error('[transfer]', e.message)
    return res.status(500).json({ error: e.message })
  }
}

export default requireAuth(handler, 'admin')
