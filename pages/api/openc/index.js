import { requireAuth } from '../../../lib/auth'
import { getOpenPool, getOpenCStats } from '../../../lib/openc-db'

async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  const [leads, stats] = await Promise.all([getOpenPool(), getOpenCStats()])
  return res.status(200).json({ leads, stats })
}

export default requireAuth(handler)
