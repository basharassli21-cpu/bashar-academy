import { requireAuth } from '../../../lib/auth'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL || process.env.POSTGRES_URL)

async function handler(req, res) {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'غير مسموح' })

  // ── GET: paginated leads list ──────────────────────────────────────────
  if (req.method === 'GET') {
    const { q='', employeeId='', status='', page=1, limit=40 } = req.query
    const off = (parseInt(page)-1) * parseInt(limit)

    const qLike = `%${q}%`
    const eid = employeeId ? parseInt(employeeId) : null
    const st  = status || null

    const [rows, countRows] = await Promise.all([
      sql`
        SELECT l.id, l.customer_name, l.phone, l.status, l.source, l.sequence,
               l.created_at, l.last_contact_date, l.next_followup_date, l.closed_at,
               e.id AS emp_id, e.name AS employee_name
        FROM leads l
        LEFT JOIN employees e ON e.id = l.employee_id
        WHERE (${q} = '' OR l.customer_name ILIKE ${qLike} OR l.phone ILIKE ${qLike})
          AND (${eid}::integer IS NULL OR l.employee_id = ${eid})
          AND (${st}::text IS NULL OR l.status = ${st})
        ORDER BY l.created_at DESC
        LIMIT ${parseInt(limit)} OFFSET ${off}
      `,
      sql`
        SELECT COUNT(*)::int AS n FROM leads l
        WHERE (${q} = '' OR l.customer_name ILIKE ${qLike} OR l.phone ILIKE ${qLike})
          AND (${eid}::integer IS NULL OR l.employee_id = ${eid})
          AND (${st}::text IS NULL OR l.status = ${st})
      `,
    ])

    return res.status(200).json({ leads: rows, total: countRows[0].n, page: parseInt(page), limit: parseInt(limit) })
  }

  return res.status(405).end()
}

export default requireAuth(handler, 'admin')
