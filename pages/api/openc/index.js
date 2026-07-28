import { requireAuth } from '../../../lib/auth'
import { getOpenPool, getOpenCStats } from '../../../lib/openc-db'

function maskPhone(phone) {
  if (!phone) return ''
  const s = String(phone).replace(/\s/g, '')
  if (s.length <= 5) return '***'
  return s.slice(0, 3) + '****' + s.slice(-2)
}

async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  if (req.user.role !== 'admin' && req.user.role !== 'employee') {
    return res.status(403).json({ error: 'غير مسموح' })
  }
  const [leads, stats] = await Promise.all([getOpenPool(), getOpenCStats()])
  const maskedLeads = leads.map(l => ({ ...l, phone: maskPhone(l.phone), masked: true }))
  res.setHeader('Cache-Control', 'private, max-age=15, stale-while-revalidate=30')
  return res.status(200).json({ leads: maskedLeads, stats })
}

export default requireAuth(handler)
