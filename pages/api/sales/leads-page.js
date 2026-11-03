import { requireAuth } from '../../../lib/auth'
import { getEmployeeByUsername, getLeadsPageData } from '../../../lib/sales-db'

async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()
  if (req.user.role !== 'employee') return res.status(403).json({ error: 'غير مسموح' })

  const employee = await getEmployeeByUsername(req.user.username)
  if (!employee) return res.status(404).json({ error: 'الموظف غير موجود' })

  const { tab = 'all', q = '', page = '1', limit = '30' } = req.query
  const data = await getLeadsPageData(employee.id, {
    tab, q, page: parseInt(page), limit: parseInt(limit),
  })
  return res.status(200).json(data)
}

export default requireAuth(handler)
