import { requireAuth } from '../../../../lib/auth'
import { getEmployeeByUsername, getLeadsForEmployee, updateLead } from '../../../../lib/sales-db'

async function handler(req, res) {
  if (req.method !== 'PATCH') return res.status(405).json({ error: 'Method not allowed' })
  if (req.user.role !== 'employee') return res.status(403).json({ error: 'غير مسموح' })

  const { id } = req.query
  const leadId = Number(id)

  const employee = await getEmployeeByUsername(req.user.username)
  if (!employee) return res.status(404).json({ error: 'الموظف غير موجود' })

  const leads = await getLeadsForEmployee(employee.id)
  const target = leads.find(l => l.id === leadId)
  if (!target) return res.status(404).json({ error: 'العميل المحتمل غير موجود' })
  if (target.locked) return res.status(403).json({ error: 'يجب التعامل مع العملاء السابقين أولاً' })

  const { status, note, lastContactDate, nextFollowupDate } = req.body || {}
  if (!status && !note && !lastContactDate && !nextFollowupDate) {
    return res.status(400).json({ error: 'لا يوجد تغييرات لحفظها' })
  }

  try {
    const updated = await updateLead(leadId, { status, note, lastContactDate, nextFollowupDate })
    return res.status(200).json({ lead: updated })
  } catch (err) {
    return res.status(400).json({ error: 'بيانات غير صحيحة' })
  }
}

export default requireAuth(handler)
