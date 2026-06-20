import { requireAuth } from '../../../../lib/auth'
import { checkExistingPhones } from '../../../../lib/import-db'

async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'صلاحيات غير كافية' })

  const { phones } = req.body || {}
  if (!Array.isArray(phones)) return res.status(400).json({ error: 'phones must be an array' })

  const existingMap = await checkExistingPhones(phones.map(p => String(p).trim()).filter(Boolean))
  return res.status(200).json({ existing: [...existingMap.keys()] })
}

export default requireAuth(handler)
