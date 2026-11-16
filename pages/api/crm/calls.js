import { requireAuth } from '../../../lib/auth'
import { getDailyCallReport, getCallTrend, getEmployeeCallsOnDate } from '../../../lib/sales-db'

// Admin: daily calls per employee.
//   GET ?date=YYYY-MM-DD               → per-employee summary + 7-day trend
//   GET ?date=YYYY-MM-DD&employeeId=N  → that employee's contacts that day
async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'غير مسموح' })

  const { date, employeeId } = req.query
  if (employeeId) {
    return res.status(200).json({ calls: await getEmployeeCallsOnDate(employeeId, date) })
  }
  const [report, trend] = await Promise.all([getDailyCallReport(date), getCallTrend(7)])
  return res.status(200).json({ ...report, trend })
}

export default requireAuth(handler, 'admin')
