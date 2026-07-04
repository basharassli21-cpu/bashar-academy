import { requireAuth } from '../../../lib/auth'
import { createSale, getSales, updateSale, softDeleteSale, getEmployeesForFinance } from '../../../lib/finance-db'

async function handler(req, res) {
  if (req.method === 'GET') {
    if (req.query.employees) {
      const emps = await getEmployeesForFinance()
      return res.status(200).json({ employees: emps })
    }
    const { search, status, employeeId, dateFrom, dateTo, productType, page, limit } = req.query
    const data = await getSales({ search, status, employeeId, dateFrom, dateTo, productType,
      page: parseInt(page) || 1, limit: parseInt(limit) || 50 })
    return res.status(200).json(data)
  }

  if (req.method === 'POST') {
    const data = req.body || {}
    if (!data.total && !data.subtotal) return res.status(400).json({ error: 'total is required' })
    const sale = await createSale(data, req.user.username)
    return res.status(201).json({ sale })
  }

  if (req.method === 'PATCH') {
    const { id, ...updates } = req.body || {}
    if (!id) return res.status(400).json({ error: 'missing id' })
    const sale = await updateSale(id, updates, req.user.username)
    return res.status(200).json({ sale })
  }

  if (req.method === 'DELETE') {
    const { id } = req.body || {}
    if (!id) return res.status(400).json({ error: 'missing id' })
    await softDeleteSale(id, req.user.username)
    return res.status(200).json({ success: true })
  }

  return res.status(405).end()
}

export default requireAuth(handler, 'admin')
