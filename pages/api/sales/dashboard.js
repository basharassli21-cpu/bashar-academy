import { requireAuth } from '../../../lib/auth'
import { getEmployeeByUsername, getDashboardStats } from '../../../lib/sales-db'

async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()
  if (req.user.role !== 'employee') return res.status(403).json({ error: 'غير مسموح' })

  const employee = await getEmployeeByUsername(req.user.username)
  if (!employee) return res.status(404).json({ error: 'الموظف غير موجود' })

  const stats = await getDashboardStats(employee.id)
  const target = employee.monthly_target || 0
  const targetProgress = target > 0 ? Math.min(Math.round((stats.revenueThisMonth / target) * 100), 100) : 0
  return res.status(200).json({ stats, employee: { name: employee.name, monthlyTarget: target, targetProgress } })
}

export default requireAuth(handler)
