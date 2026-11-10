import { requireAuth } from '../../../lib/auth'
import { normalizeLead } from '../../../lib/sales-db'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL || process.env.POSTGRES_URL)

async function handler(req, res) {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'غير مسموح' })

  if (req.method !== 'GET') return res.status(405).end()

  const { q = '', employeeId = '', status = '', source = '', page = 1, limit = 40 } = req.query
  const off  = (parseInt(page) - 1) * parseInt(limit)
  const lim  = parseInt(limit)
  const qLike = `%${q}%`
  const eid   = parseInt(employeeId)

  // Each filter is its own fragment, left empty when the filter is off
  const filters = sql`
    WHERE TRUE
    ${q.trim() !== '' ? sql`AND (l.customer_name ILIKE ${qLike} OR l.phone ILIKE ${qLike})` : sql``}
    ${!isNaN(eid) ? sql`AND l.employee_id = ${eid}` : sql``}
    ${status !== '' ? sql`AND l.status = ${status}` : sql``}
    ${source === 'openc' ? sql`AND l.claimed_from_openc_id IS NOT NULL` : source === 'fresh' ? sql`AND l.claimed_from_openc_id IS NULL` : sql``}
  `

  const [rows, countRows] = await Promise.all([
    sql`
      SELECT l.id, l.customer_name, l.phone, l.status,
             l.created_at, l.last_contact_date, l.next_followup_date, l.claimed_from_openc_id,
             e.name AS employee_name
      FROM leads l
      LEFT JOIN employees e ON e.id = l.employee_id
      ${filters}
      ORDER BY l.created_at DESC
      LIMIT ${lim} OFFSET ${off}
    `,
    sql`SELECT COUNT(*)::int AS n FROM leads l ${filters}`,
  ])

  return res.status(200).json({
    leads: rows.map(normalizeLead),
    total: countRows[0].n,
    page: parseInt(page),
    limit: lim,
  })
}

export default requireAuth(handler, 'admin')
