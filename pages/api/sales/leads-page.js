import { requireAuth } from '../../../lib/auth'
import { getEmployeeByUsername, getLeadsPageData } from '../../../lib/sales-db'

async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()
  if (req.user.role !== 'employee') return res.status(403).json({ error: 'غير مسموح' })

  const employee = await getEmployeeByUsername(req.user.username)
  if (!employee) return res.status(404).json({ error: 'الموظف غير موجود' })

  const { source, tab = 'all', q = '', page, limit } = req.query
  const data = await getLeadsPageData(employee.id, {
    source, tab, q: String(q).trim(),
    page: Math.max(1, parseInt(page) || 1),
    limit: Math.min(100, Math.max(1, parseInt(limit) || 30)),
  })
  return res.status(200).json(data)
}

export default requireAuth(handler)
