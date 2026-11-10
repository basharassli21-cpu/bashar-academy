import { requireAuth } from '../../../lib/auth'
import { getEmployeeByUsername, getLeadCounts } from '../../../lib/sales-db'

async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()
  if (req.user.role !== 'employee') return res.status(403).json({ error: 'غير مسموح' })

  const employee = await getEmployeeByUsername(req.user.username)
  if (!employee) return res.status(404).json({ error: 'الموظف غير موجود' })

  return res.status(200).json({ counts: await getLeadCounts(employee.id) })
}

export default requireAuth(handler)
