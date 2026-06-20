import { requireAuth } from '../../../../lib/auth'
import { getEmployeeByUsername } from '../../../../lib/sales-db'
import { claimOpenCLead, AlreadyClaimedError } from '../../../../lib/openc-db'

async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { id } = req.query
  const opencId = Number(id)

  let claimingEmployeeId
  let actorEmployeeId = null

  if (req.user.role === 'employee') {
    const employee = await getEmployeeByUsername(req.user.username)
    if (!employee) return res.status(404).json({ error: 'الموظف غير موجود' })
    claimingEmployeeId = employee.id
    actorEmployeeId = employee.id
  } else if (req.user.role === 'admin') {
    const { employeeId } = req.body || {}
    if (!employeeId) return res.status(400).json({ error: 'يرجى اختيار الموظف' })
    claimingEmployeeId = Number(employeeId)
  } else {
    return res.status(403).json({ error: 'غير مسموح' })
  }

  try {
    const result = await claimOpenCLead({
      opencId, claimingEmployeeId, actorRole: req.user.role, actorEmployeeId,
    })
    return res.status(200).json(result)
  } catch (err) {
    if (err instanceof AlreadyClaimedError) return res.status(409).json({ error: err.message })
    console.error('[openc claim] error:', err)
    return res.status(500).json({ error: 'حدث خطأ، حاول مرة أخرى' })
  }
}

export default requireAuth(handler)
