import { requireAuth } from '../../../lib/auth'
import { getEmployeeByUsername, getEmployeeMonthlyStats } from '../../../lib/sales-db'

async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  if (req.user.role !== 'employee') return res.status(403).json({ error: 'غير مسموح' })

  const employee = await getEmployeeByUsername(req.user.username)
  if (!employee) return res.status(404).json({ error: 'الموظف غير موجود' })

  const stats = await getEmployeeMonthlyStats(employee.id)
  return res.status(200).json({ stats })
}

export default requireAuth(handler)
