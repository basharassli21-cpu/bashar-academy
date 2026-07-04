import { requireAuth } from '../../../lib/auth'
import { createExpense, getExpenses, updateExpense, softDeleteExpense } from '../../../lib/finance-db'

async function handler(req, res) {
  if (req.method === 'GET') {
    const { search, category, status, dateFrom, dateTo, page, limit } = req.query
    const data = await getExpenses({ search, category, status, dateFrom, dateTo,
      page: parseInt(page) || 1, limit: parseInt(limit) || 50 })
    return res.status(200).json(data)
  }

  if (req.method === 'POST') {
    const data = req.body || {}
    if (!data.category || !data.amount) return res.status(400).json({ error: 'category and amount required' })
    const expense = await createExpense(data, req.user.username)
    return res.status(201).json({ expense })
  }

  if (req.method === 'PATCH') {
    const { id, ...updates } = req.body || {}
    if (!id) return res.status(400).json({ error: 'missing id' })
    const expense = await updateExpense(id, updates, req.user.username)
    return res.status(200).json({ expense })
  }

  if (req.method === 'DELETE') {
    const { id } = req.body || {}
    if (!id) return res.status(400).json({ error: 'missing id' })
    await softDeleteExpense(id, req.user.username)
    return res.status(200).json({ success: true })
  }

  return res.status(405).end()
}

export default requireAuth(handler, 'admin')
