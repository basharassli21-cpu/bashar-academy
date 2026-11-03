import { requireAuth } from '../../../lib/auth'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL || process.env.POSTGRES_URL)

async function handler(req, res) {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'غير مسموح' })

  if (req.method !== 'GET') return res.status(405).end()

  const { q = '', employeeId = '', status = '', page = 1, limit = 40 } = req.query
  const off  = (parseInt(page) - 1) * parseInt(limit)
  const lim  = parseInt(limit)
  const qLike = `%${q}%`

  // Build optional filter parts separately to avoid NULL-cast issues
  const hasQ   = q.trim() !== ''
  const hasEmp = employeeId !== '' && !isNaN(parseInt(employeeId))
  const hasSt  = status !== ''
  const eid    = hasEmp ? parseInt(employeeId) : null

  let rows, countRows

  if (!hasQ && !hasEmp && !hasSt) {
    // No filters — fastest path
    ;[rows, countRows] = await Promise.all([
      sql`
        SELECT l.id, l.customer_name, l.phone, l.status,
               l.created_at, l.last_contact_date, l.next_followup_date,
               e.name AS employee_name
        FROM leads l
        LEFT JOIN employees e ON e.id = l.employee_id
        ORDER BY l.created_at DESC
        LIMIT ${lim} OFFSET ${off}
      `,
      sql`SELECT COUNT(*)::int AS n FROM leads`,
    ])
  } else if (hasQ && !hasEmp && !hasSt) {
    ;[rows, countRows] = await Promise.all([
      sql`
        SELECT l.id, l.customer_name, l.phone, l.status,
               l.created_at, l.last_contact_date, l.next_followup_date,
               e.name AS employee_name
        FROM leads l LEFT JOIN employees e ON e.id = l.employee_id
        WHERE l.customer_name ILIKE ${qLike} OR l.phone ILIKE ${qLike}
        ORDER BY l.created_at DESC LIMIT ${lim} OFFSET ${off}
      `,
      sql`SELECT COUNT(*)::int AS n FROM leads WHERE customer_name ILIKE ${qLike} OR phone ILIKE ${qLike}`,
    ])
  } else if (!hasQ && hasEmp && !hasSt) {
    ;[rows, countRows] = await Promise.all([
      sql`
        SELECT l.id, l.customer_name, l.phone, l.status,
               l.created_at, l.last_contact_date, l.next_followup_date,
               e.name AS employee_name
        FROM leads l LEFT JOIN employees e ON e.id = l.employee_id
        WHERE l.employee_id = ${eid}
        ORDER BY l.created_at DESC LIMIT ${lim} OFFSET ${off}
      `,
      sql`SELECT COUNT(*)::int AS n FROM leads WHERE employee_id = ${eid}`,
    ])
  } else if (!hasQ && !hasEmp && hasSt) {
    ;[rows, countRows] = await Promise.all([
      sql`
        SELECT l.id, l.customer_name, l.phone, l.status,
               l.created_at, l.last_contact_date, l.next_followup_date,
               e.name AS employee_name
        FROM leads l LEFT JOIN employees e ON e.id = l.employee_id
        WHERE l.status = ${status}
        ORDER BY l.created_at DESC LIMIT ${lim} OFFSET ${off}
      `,
      sql`SELECT COUNT(*)::int AS n FROM leads WHERE status = ${status}`,
    ])
  } else if (hasQ && hasEmp && !hasSt) {
    ;[rows, countRows] = await Promise.all([
      sql`
        SELECT l.id, l.customer_name, l.phone, l.status,
               l.created_at, l.last_contact_date, l.next_followup_date,
               e.name AS employee_name
        FROM leads l LEFT JOIN employees e ON e.id = l.employee_id
        WHERE (l.customer_name ILIKE ${qLike} OR l.phone ILIKE ${qLike})
          AND l.employee_id = ${eid}
        ORDER BY l.created_at DESC LIMIT ${lim} OFFSET ${off}
      `,
      sql`SELECT COUNT(*)::int AS n FROM leads WHERE (customer_name ILIKE ${qLike} OR phone ILIKE ${qLike}) AND employee_id = ${eid}`,
    ])
  } else if (hasQ && !hasEmp && hasSt) {
    ;[rows, countRows] = await Promise.all([
      sql`
        SELECT l.id, l.customer_name, l.phone, l.status,
               l.created_at, l.last_contact_date, l.next_followup_date,
               e.name AS employee_name
        FROM leads l LEFT JOIN employees e ON e.id = l.employee_id
        WHERE (l.customer_name ILIKE ${qLike} OR l.phone ILIKE ${qLike})
          AND l.status = ${status}
        ORDER BY l.created_at DESC LIMIT ${lim} OFFSET ${off}
      `,
      sql`SELECT COUNT(*)::int AS n FROM leads WHERE (customer_name ILIKE ${qLike} OR phone ILIKE ${qLike}) AND status = ${status}`,
    ])
  } else if (!hasQ && hasEmp && hasSt) {
    ;[rows, countRows] = await Promise.all([
      sql`
        SELECT l.id, l.customer_name, l.phone, l.status,
               l.created_at, l.last_contact_date, l.next_followup_date,
               e.name AS employee_name
        FROM leads l LEFT JOIN employees e ON e.id = l.employee_id
        WHERE l.employee_id = ${eid} AND l.status = ${status}
        ORDER BY l.created_at DESC LIMIT ${lim} OFFSET ${off}
      `,
      sql`SELECT COUNT(*)::int AS n FROM leads WHERE employee_id = ${eid} AND status = ${status}`,
    ])
  } else {
    // hasQ && hasEmp && hasSt
    ;[rows, countRows] = await Promise.all([
      sql`
        SELECT l.id, l.customer_name, l.phone, l.status,
               l.created_at, l.last_contact_date, l.next_followup_date,
               e.name AS employee_name
        FROM leads l LEFT JOIN employees e ON e.id = l.employee_id
        WHERE (l.customer_name ILIKE ${qLike} OR l.phone ILIKE ${qLike})
          AND l.employee_id = ${eid} AND l.status = ${status}
        ORDER BY l.created_at DESC LIMIT ${lim} OFFSET ${off}
      `,
      sql`SELECT COUNT(*)::int AS n FROM leads WHERE (customer_name ILIKE ${qLike} OR phone ILIKE ${qLike}) AND employee_id = ${eid} AND status = ${status}`,
    ])
  }

  return res.status(200).json({
    leads: rows,
    total: countRows[0].n,
    page: parseInt(page),
    limit: lim,
  })
}

export default requireAuth(handler, 'admin')
