import { requireAuth } from '../../../lib/auth'
import { getEmployeeByUsername, getLeadWithNotes } from '../../../lib/sales-db'

async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()
  if (req.user.role !== 'employee') return res.status(403).json({ error: 'غير مسموح' })

  const { id } = req.query
  if (!id) return res.status(400).json({ error: 'id مطلوب' })

  const employee = await getEmployeeByUsername(req.user.username)
  if (!employee) return res.status(404).json({ error: 'الموظف غير موجود' })

  const lead = await getLeadWithNotes(parseInt(id), employee.id)
  if (!lead) return res.status(404).json({ error: 'العميل غير موجود' })

  return res.status(200).json({ lead })
}

export default requireAuth(handler)
