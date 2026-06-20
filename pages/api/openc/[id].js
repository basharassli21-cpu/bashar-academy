import { requireAuth } from '../../../lib/auth'
import { updateOpenCLead } from '../../../lib/openc-db'

async function handler(req, res) {
  if (req.method !== 'PATCH') return res.status(405).json({ error: 'Method not allowed' })
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'صلاحيات غير كافية' })

  const { id } = req.query
  const { customerName, phone, reason } = req.body || {}
  const updated = await updateOpenCLead(id, { customerName, phone, reason })
  if (!updated) return res.status(404).json({ error: 'غير موجود' })
  return res.status(200).json({ success: true, lead: updated })
}

export default requireAuth(handler)
