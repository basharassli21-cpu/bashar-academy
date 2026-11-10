import { requireAuth } from '../../../../lib/auth'
import {
  getEmployeeByUsername, getLeadForEmployee, getLeadWithNotes, updateLead,
  todayInJordan, STATUSES, NOTE_TYPES, CALL_STATUSES,
} from '../../../../lib/sales-db'
import { returnLeadToOpenC } from '../../../../lib/openc-db'

const AUTO_OPENC_STATUSES = ['not_interested', 'cancelled']
const STATUS_LABELS_AR = { not_interested: 'غير مهتم', cancelled: 'ملغي' }

async function handler(req, res) {
  if (req.method !== 'PATCH') return res.status(405).json({ error: 'Method not allowed' })
  if (req.user.role !== 'employee') return res.status(403).json({ error: 'غير مسموح' })

  const leadId = parseInt(req.query.id, 10)
  if (!leadId || leadId <= 0) return res.status(400).json({ error: 'معرّف غير صحيح' })

  const { status, note, noteType, callStatus, duration, nextFollowupDate } = req.body || {}
  if (status && !STATUSES.includes(status)) {
    return res.status(400).json({ error: 'حالة غير صحيحة' })
  }
  if (note && (typeof note !== 'string' || note.length > 2000)) {
    return res.status(400).json({ error: 'الملاحظة يجب أن تكون نصاً لا يتجاوز 2000 حرف' })
  }
  if (noteType && !NOTE_TYPES.includes(noteType)) {
    return res.status(400).json({ error: 'نوع النشاط غير صحيح' })
  }
  if (callStatus && !CALL_STATUSES.includes(callStatus)) {
    return res.status(400).json({ error: 'نتيجة المكالمة غير صحيحة' })
  }
  const durationMinutes = duration === undefined || duration === null || duration === '' ? null : Number(duration)
  if (durationMinutes !== null && (!Number.isInteger(durationMinutes) || durationMinutes < 0 || durationMinutes > 1440)) {
    return res.status(400).json({ error: 'مدة المكالمة غير صحيحة' })
  }
  if (nextFollowupDate !== undefined && nextFollowupDate !== null && !/^\d{4}-\d{2}-\d{2}$/.test(nextFollowupDate)) {
    return res.status(400).json({ error: 'موعد المتابعة غير صحيح' })
  }

  const employee = await getEmployeeByUsername(req.user.username)
  if (!employee) return res.status(404).json({ error: 'الموظف غير موجود' })

  const target = await getLeadForEmployee(leadId, employee.id)
  if (!target) return res.status(404).json({ error: 'العميل المحتمل غير موجود' })

  if (!status && !note && !noteType && nextFollowupDate === undefined) {
    return res.status(400).json({ error: 'لا يوجد تغييرات لحفظها' })
  }

  try {
    const updated = await updateLead(leadId, { status, note, noteType, callStatus, durationMinutes, nextFollowupDate })

    if (AUTO_OPENC_STATUSES.includes(updated.status) && target.status !== updated.status) {
      const reason = (note && note.trim()) || `تم تحديد الحالة: ${STATUS_LABELS_AR[updated.status]}`
      await returnLeadToOpenC({
        leadId, reason, actorRole: 'employee', actorEmployeeId: employee.id,
      })
    }

    const lead = await getLeadWithNotes(leadId, employee.id)
    return res.status(200).json({ lead, today: todayInJordan() })
  } catch (err) {
    console.error('[lead update]', err)
    return res.status(400).json({ error: 'بيانات غير صحيحة' })
  }
}

export default requireAuth(handler)
