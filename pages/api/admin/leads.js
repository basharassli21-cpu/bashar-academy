import { requireAuth } from '../../../lib/auth'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL || process.env.POSTGRES_URL)

async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'غير مسموح' })

  const { employeeId, status } = req.query

  let rows
  if (employeeId) {
    const eid = parseInt(employeeId, 10)
    if (status) {
      rows = await sql`
        SELECT l.*, e.name AS employee_name
        FROM leads l JOIN employees e ON e.id = l.employee_id
        WHERE l.employee_id = ${eid} AND l.status = ${status}
        ORDER BY l.sequence ASC
      `
    } else {
      rows = await sql`
        SELECT l.*, e.name AS employee_name
        FROM leads l JOIN employees e ON e.id = l.employee_id
        WHERE l.employee_id = ${eid}
        ORDER BY l.sequence ASC
      `
    }
  } else if (status) {
    rows = await sql`
      SELECT l.*, e.name AS employee_name
      FROM leads l JOIN employees e ON e.id = l.employee_id
      WHERE l.status = ${status}
      ORDER BY l.employee_id ASC, l.sequence ASC
    `
  } else {
    rows = await sql`
      SELECT l.*, e.name AS employee_name
      FROM leads l JOIN employees e ON e.id = l.employee_id
      ORDER BY l.employee_id ASC, l.sequence ASC
    `
  }

  return res.status(200).json({ leads: rows })
}

export default requireAuth(handler, 'admin')
