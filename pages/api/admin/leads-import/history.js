import { requireAuth } from '../../../../lib/auth'
import { getImportHistory } from '../../../../lib/import-db'

async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'صلاحيات غير كافية' })

  const history = await getImportHistory()
  return res.status(200).json({ history })
}

export default requireAuth(handler)
