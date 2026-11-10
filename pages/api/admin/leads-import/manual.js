import { requireAuth } from '../../../../lib/auth'
import { getEmployeeById } from '../../../../lib/sales-db'
import { addManualLeads } from '../../../../lib/import-db'

const MAX_ENTRIES = 1000

async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { entries, employeeId, source } = req.body || {}
  if (!Array.isArray(entries) || entries.length === 0) {
    return res.status(400).json({ error: 'لا يوجد أرقام لإضافتها' })
  }
  if (entries.length > MAX_ENTRIES) {
    return res.status(400).json({ error: `الحد الأقصى ${MAX_ENTRIES} رقم في المرة الواحدة` })
  }
  if (!['fresh', 'openc'].includes(source)) {
    return res.status(400).json({ error: 'نوع الأرقام غير صحيح' })
  }
  const eid = Number(employeeId)
  const employee = Number.isInteger(eid) && eid > 0 ? await getEmployeeById(eid) : null
  if (!employee) return res.status(400).json({ error: 'يرجى اختيار الموظف' })

  try {
    const summary = await addManualLeads({
      entries, employeeId: employee.id, source, uploadedBy: req.user.username,
    })
    return res.status(200).json(summary)
  } catch (err) {
    console.error('[leads-import manual] error:', err)
    return res.status(500).json({ error: 'حدث خطأ أثناء إضافة الأرقام' })
  }
}

export default requireAuth(handler, 'admin')
