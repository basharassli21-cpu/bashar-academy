import { requireAuth } from '../../../../lib/auth'
import { getEmployeeByUsername, getLeadsForEmployee, updateLead } from '../../../../lib/sales-db'
import { returnLeadToOpenC } from '../../../../lib/openc-db'

const AUTO_OPENC_STATUSES = ['not_interested', 'cancelled']
const STATUS_LABELS_AR = { not_interested: 'غير مهتم', cancelled: 'ملغي' }

async function handler(req, res) {
  if (req.method !== 'PATCH') return res.status(405).json({ error: 'Method not allowed' })
  if (req.user.role !== 'employee') return res.status(403).json({ error: 'غير مسموح' })

  const leadId = parseInt(req.query.id, 10)
  if (!leadId || leadId <= 0) return res.status(400).json({ error: 'معرّف غير صحيح' })

  const { status, note, lastContactDate, nextFollowupDate } = req.body || {}
  const VALID_STATUSES = ['new', 'contacted', 'interested', 'not_interested', 'closed_sale', 'cancelled', 'unreachable']
  if (status && !VALID_STATUSES.includes(status)) {
    return res.status(400).json({ error: 'حالة غير صحيحة' })
  }
  if (note && (typeof note !== 'string' || note.length > 2000)) {
    return res.status(400).json({ error: 'الملاحظة يجب أن تكون نصاً لا يتجاوز 2000 حرف' })
  }

  const employee = await getEmployeeByUsername(req.user.username)
  if (!employee) return res.status(404).json({ error: 'الموظف غير موجود' })

  const leads = await getLeadsForEmployee(employee.id)
  const target = leads.find(l => l.id === leadId)
  if (!target) return res.status(404).json({ error: 'العميل المحتمل غير موجود' })
  if (target.locked) return res.status(403).json({ error: 'يجب التعامل مع العملاء السابقين أولاً' })

  if (!status && !note && !lastContactDate && !nextFollowupDate) {
    return res.status(400).json({ error: 'لا يوجد تغييرات لحفظها' })
  }

  try {
    const updated = await updateLead(leadId, { status, note, lastContactDate, nextFollowupDate })

    if (AUTO_OPENC_STATUSES.includes(updated.status) && target.status !== updated.status) {
      const reason = (note && note.trim()) || `تم تحديد الحالة: ${STATUS_LABELS_AR[updated.status]}`
      await returnLeadToOpenC({
        leadId, reason, actorRole: 'employee', actorEmployeeId: employee.id,
      })
    }

    return res.status(200).json({ lead: updated })
  } catch (err) {
    return res.status(400).json({ error: 'بيانات غير صحيحة' })
  }
}

export default requireAuth(handler)
