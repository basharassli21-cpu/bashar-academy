import { requireAuth } from '../../../lib/auth'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL || process.env.POSTGRES_URL)

async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'غير مسموح' })

  const now = new Date()
  const y = now.getFullYear(), m = now.getMonth() + 1
  const monthStart = `${y}-${String(m).padStart(2,'0')}-01`
  const monthEnd   = new Date(y, m, 1).toISOString()
  const today      = now.toISOString().split('T')[0]

  const [
    totalLeads, leadsByStatus, totalEmployees,
    opencStats,
    revToday, revMonth, revYear,
    salesToday, salesMonth,
    empStats,
    recentSales,
  ] = await Promise.all([
    sql`SELECT COUNT(*)::int AS n FROM leads`,
    sql`SELECT status, COUNT(*)::int AS n FROM leads GROUP BY status ORDER BY n DESC`,
    sql`SELECT COUNT(*)::int AS n FROM employees`,
    sql`SELECT COUNT(*)::int AS total, COUNT(*) FILTER (WHERE status='open')::int AS open FROM openc_leads`,
    sql`SELECT COALESCE(SUM(amount_paid),0)::numeric AS rev FROM sale_records WHERE sale_date = ${today} AND sale_status != 'cancelled'`,
    sql`SELECT COALESCE(SUM(amount_paid),0)::numeric AS rev FROM sale_records WHERE EXTRACT(YEAR FROM sale_date)=${y} AND EXTRACT(MONTH FROM sale_date)=${m} AND sale_status != 'cancelled'`,
    sql`SELECT COALESCE(SUM(amount_paid),0)::numeric AS rev FROM sale_records WHERE EXTRACT(YEAR FROM sale_date)=${y} AND sale_status != 'cancelled'`,
    sql`SELECT COUNT(*)::int AS n FROM sale_records WHERE sale_date = ${today} AND sale_status != 'cancelled'`,
    sql`SELECT COUNT(*)::int AS n FROM sale_records WHERE EXTRACT(YEAR FROM sale_date)=${y} AND EXTRACT(MONTH FROM sale_date)=${m} AND sale_status != 'cancelled'`,
    sql`
      SELECT e.id, e.name, e.username, e.monthly_target,
        COUNT(DISTINCT l.id)::int AS total_leads,
        COUNT(DISTINCT l.id) FILTER (WHERE l.status = 'closed_sale')::int AS closed_leads,
        COALESCE(SUM(sr.amount_paid) FILTER (WHERE EXTRACT(YEAR FROM sr.sale_date)=${y} AND EXTRACT(MONTH FROM sr.sale_date)=${m} AND sr.sale_status != 'cancelled'), 0)::numeric AS rev_month,
        COUNT(DISTINCT cl.id) FILTER (WHERE cl.created_at >= ${monthStart} AND cl.created_at < ${monthEnd})::int AS calls_month
      FROM employees e
      LEFT JOIN leads l ON l.employee_id = e.id
      LEFT JOIN sale_records sr ON sr.employee_id = e.id
      LEFT JOIN call_logs cl ON cl.employee_id = e.id
      GROUP BY e.id ORDER BY rev_month DESC
    `,
    sql`SELECT sr.student_name, sr.amount_paid, sr.sale_date, sr.package_name, e.name AS employee_name FROM sale_records sr LEFT JOIN employees e ON e.id = sr.employee_id ORDER BY sr.created_at DESC LIMIT 10`,
  ])

  return res.status(200).json({
    totalLeads: totalLeads[0].n,
    leadsByStatus,
    totalEmployees: totalEmployees[0].n,
    opencTotal: opencStats[0]?.total || 0,
    opencOpen: opencStats[0]?.open || 0,
    revenueToday: parseFloat(revToday[0].rev) || 0,
    revenueMonth: parseFloat(revMonth[0].rev) || 0,
    revenueYear: parseFloat(revYear[0].rev) || 0,
    salesToday: salesToday[0].n,
    salesMonth: salesMonth[0].n,
    employeeStats: empStats.map(r => ({
      id: r.id, name: r.name, username: r.username,
      monthlyTarget: r.monthly_target || 0,
      totalLeads: r.total_leads, closedLeads: r.closed_leads,
      revenueMonth: parseFloat(r.rev_month) || 0,
      callsMonth: r.calls_month,
      targetProgress: r.monthly_target > 0 ? Math.min(Math.round((parseFloat(r.rev_month) / r.monthly_target) * 100), 100) : 0,
    })),
    recentSales,
  })
}

export default requireAuth(handler, 'admin')
