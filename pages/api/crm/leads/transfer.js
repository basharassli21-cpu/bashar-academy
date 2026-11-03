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
    let rows
    if (status) {
      rows = await sql`
        UPDATE leads
        SET employee_id = ${parseInt(toEmployeeId)}, updated_at = now()
        WHERE employee_id = ${parseInt(fromEmployeeId)} AND status = ${status}
        RETURNING id
      `
    } else {
      rows = await sql`
        UPDATE leads
        SET employee_id = ${parseInt(toEmployeeId)}, updated_at = now()
        WHERE employee_id = ${parseInt(fromEmployeeId)}
        RETURNING id
      `
    }
    return res.status(200).json({ transferred: rows.length })
  } catch (e) {
    console.error('[transfer]', e.message)
    return res.status(500).json({ error: e.message })
  }
}

export default requireAuth(handler, 'admin')
