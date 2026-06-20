import { requireAuth } from '../../../../../lib/auth'
import { getLeadsForEmployee, createLead } from '../../../../../lib/sales-db'

async function handler(req, res) {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'صلاحيات غير كافية' })
  const { id } = req.query
  const employeeId = Number(id)

  if (req.method === 'GET') {
    const leads = await getLeadsForEmployee(employeeId)
    return res.status(200).json({ leads })
  }

  if (req.method === 'POST') {
    const { customerName, phone } = req.body || {}
    if (!customerName || !phone) return res.status(400).json({ error: 'يرجى إدخال الاسم ورقم الهاتف' })
    const lead = await createLead({ employeeId, customerName: customerName.trim(), phone: phone.trim() })
    return res.status(201).json({ success: true, lead })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}

export default requireAuth(handler)
