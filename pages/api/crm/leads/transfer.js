import { requireAuth } from '../../../../lib/auth'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL || process.env.POSTGRES_URL)

async function handler(req, res) {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'غير مسموح' })
  if (req.method !== 'POST') return res.status(405).end()

  const { fromEmployeeId, toEmployeeId, status } = req.body || {}

  if (!fromEmployeeId || !toEmployeeId)
    return res.status(400).json({ error: 'يجب تحديد الموظف المصدر والموظف الهدف' })

  if (parseInt(fromEmployeeId) === parseInt(toEmployeeId))
    return res.status(400).json({ error: 'الموظف المصدر والهدف متطابقان' })

  try {
    const fromId = parseInt(fromEmployeeId)
    const toId   = parseInt(toEmployeeId)

    // Get leads to transfer (ordered by sequence)
    const leads = status
      ? await sql`SELECT id FROM leads WHERE employee_id = ${fromId} AND status = ${status} ORDER BY sequence ASC`
      : await sql`SELECT id FROM leads WHERE employee_id = ${fromId} ORDER BY sequence ASC`

    if (!leads.length) return res.status(200).json({ transferred: 0 })

    // Get current max sequence for destination employee
    const [maxRow] = await sql`SELECT COALESCE(MAX(sequence), 0)::int AS mx FROM leads WHERE employee_id = ${toId}`
    let nextSeq = maxRow.mx + 1

    // Transfer one by one with new sequence numbers to avoid constraint violation
    for (const lead of leads) {
      await sql`
        UPDATE leads
        SET employee_id = ${toId}, sequence = ${nextSeq}, updated_at = now()
        WHERE id = ${lead.id}
      `
      nextSeq++
    }

    return res.status(200).json({ transferred: leads.length })
  } catch (e) {
    console.error('[transfer]', e.message)
    return res.status(500).json({ error: e.message })
  }
}

export default requireAuth(handler, 'admin')
