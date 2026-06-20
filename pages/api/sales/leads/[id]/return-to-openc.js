import { requireAuth } from '../../../../../lib/auth'
import { getEmployeeByUsername, getLeadsForEmployee } from '../../../../../lib/sales-db'
import { returnLeadToOpenC } from '../../../../../lib/openc-db'

async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  if (req.user.role !== 'employee') return res.status(403).json({ error: 'غير مسموح' })

  const { id } = req.query
  const leadId = Number(id)
  const { reason } = req.body || {}
  if (!reason || !reason.trim()) return res.status(400).json({ error: 'يرجى كتابة سبب الإرجاع' })

  const employee = await getEmployeeByUsername(req.user.username)
  if (!employee) return res.status(404).json({ error: 'الموظف غير موجود' })

  const leads = await getLeadsForEmployee(employee.id)
  const target = leads.find(l => l.id === leadId)
  if (!target) return res.status(404).json({ error: 'العميل المحتمل غير موجود' })

  const opencLead = await returnLeadToOpenC({
    leadId, reason: reason.trim(), actorRole: 'employee', actorEmployeeId: employee.id,
  })
  return res.status(200).json({ success: true, opencLead })
}

export default requireAuth(handler)
