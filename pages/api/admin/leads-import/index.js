import { requireAuth } from '../../../../lib/auth'
import { getEmployeeById } from '../../../../lib/sales-db'
import { bulkImportLeads, NoEmployeesError } from '../../../../lib/import-db'

const ASSIGNMENT_MODES = ['openc', 'employee', 'round_robin']

async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'صلاحيات غير كافية' })

  const { filename, rows, duplicateStrategy, assignmentMode, employeeId } = req.body || {}
  if (!filename || !Array.isArray(rows) || rows.length === 0) {
    return res.status(400).json({ error: 'لا يوجد بيانات لاستيرادها' })
  }
  if (!['update', 'ignore'].includes(duplicateStrategy)) {
    return res.status(400).json({ error: 'duplicateStrategy غير صحيح' })
  }
  if (!ASSIGNMENT_MODES.includes(assignmentMode)) {
    return res.status(400).json({ error: 'assignmentMode غير صحيح' })
  }
  if (assignmentMode === 'employee') {
    if (!employeeId) return res.status(400).json({ error: 'يرجى اختيار الموظف' })
    const employee = await getEmployeeById(Number(employeeId))
    if (!employee) return res.status(400).json({ error: 'الموظف غير موجود' })
  }

  try {
    const summary = await bulkImportLeads({
      rows, duplicateStrategy, assignmentMode,
      employeeId: employeeId ? Number(employeeId) : null,
      filename, uploadedBy: req.user.username,
    })
    return res.status(200).json(summary)
  } catch (err) {
    if (err instanceof NoEmployeesError) return res.status(400).json({ error: err.message })
    console.error('[leads-import] error:', err)
    return res.status(500).json({ error: 'حدث خطأ أثناء الاستيراد' })
  }
}

export const config = { api: { bodyParser: { sizeLimit: '10mb' } }, maxDuration: 30 }

export default requireAuth(handler)
