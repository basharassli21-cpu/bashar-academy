import { requireAuth } from '../../../lib/auth'
import { getEmployeeByUsername, getEmployeeMonthlyStats } from '../../../lib/sales-db'
import { getOpenCStatsForEmployee } from '../../../lib/openc-db'

async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  if (req.user.role !== 'employee') return res.status(403).json({ error: 'غير مسموح' })

  const employee = await getEmployeeByUsername(req.user.username)
  if (!employee) return res.status(404).json({ error: 'الموظف غير موجود' })

  const [stats, opencStats] = await Promise.all([
    getEmployeeMonthlyStats(employee.id),
    getOpenCStatsForEmployee(employee.id),
  ])
  return res.status(200).json({ stats, opencStats })
}

export default requireAuth(handler)
