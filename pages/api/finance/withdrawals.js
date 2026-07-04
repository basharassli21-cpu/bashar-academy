import { requireAuth } from '../../../lib/auth'
import { createWithdrawal, getWithdrawals, updateWithdrawal } from '../../../lib/finance-db'

async function handler(req, res) {
  if (req.method === 'GET') {
    const { employeeId, status, page, limit } = req.query
    const data = await getWithdrawals({ employeeId, status,
      page: parseInt(page) || 1, limit: parseInt(limit) || 50 })
    return res.status(200).json(data)
  }

  if (req.method === 'POST') {
    const { employeeId, amount, currency, reason } = req.body || {}
    if (!employeeId || !amount) return res.status(400).json({ error: 'employeeId and amount required' })
    const wd = await createWithdrawal({ employeeId, amount, currency, reason }, req.user.username)
    return res.status(201).json({ withdrawal: wd })
  }

  if (req.method === 'PATCH') {
    const { id, ...updates } = req.body || {}
    if (!id || !updates.status) return res.status(400).json({ error: 'id and status required' })
    const valid = ['under_review', 'approved', 'rejected', 'paid']
    if (!valid.includes(updates.status)) return res.status(400).json({ error: 'invalid status' })
    const wd = await updateWithdrawal(id, { ...updates, approvedBy: req.user.username }, req.user.username)
    return res.status(200).json({ withdrawal: wd })
  }

  return res.status(405).end()
}

export default requireAuth(handler, 'admin')
