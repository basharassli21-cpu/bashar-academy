import { requireAuth } from '../../../lib/auth'
import { getFinanceDashboard } from '../../../lib/finance-db'

async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()
  try {
    const { period, year, month } = req.query
    const data = await getFinanceDashboard({ period, year, month })
    return res.status(200).json(data)
  } catch (e) {
    console.error('finance/dashboard error:', e)
    return res.status(500).json({ error: e.message })
  }
}

export default requireAuth(handler, 'admin')
