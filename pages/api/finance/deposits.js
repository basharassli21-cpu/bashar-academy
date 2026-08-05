import { requireAuth } from '../../../lib/auth'
import { getDeposits, createDeposit } from '../../../lib/finance-db'

async function handler(req, res) {
  if (req.method === 'GET') {
    const { page, limit } = req.query
    try {
      const data = await getDeposits({ page: parseInt(page) || 1, limit: parseInt(limit) || 20 })
      return res.status(200).json(data)
    } catch (e) {
      console.error('deposits GET error:', e)
      return res.status(500).json({ error: e.message })
    }
  }

  if (req.method === 'POST') {
    const { depositDate, amount, ownerName, paymentMethod, description, debitAccount, creditAccount } = req.body || {}
    if (!amount || !ownerName || !debitAccount || !creditAccount) {
      return res.status(400).json({ error: 'Missing required fields: amount, ownerName, debitAccount, creditAccount' })
    }
    try {
      const actor = req.user?.username || 'admin'
      const result = await createDeposit({ depositDate, amount, ownerName, paymentMethod, description, debitAccount, creditAccount, actor })
      return res.status(200).json(result)
    } catch (e) {
      console.error('deposits POST error:', e)
      return res.status(500).json({ error: e.message })
    }
  }

  return res.status(405).end()
}

export default requireAuth(handler, 'admin')
