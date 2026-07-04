import { requireAuth } from '../../../lib/auth'
import {
  getCommissions, addCommissionAdjustment, markCommissionsPaid,
  getCommissionRules, upsertCommissionRule, deleteCommissionRule,
} from '../../../lib/finance-db'

async function handler(req, res) {
  // Commission Rules
  if (req.query.rules === '1') {
    if (req.method === 'GET')    { return res.status(200).json({ rules: await getCommissionRules() }) }
    if (req.method === 'POST')   { const r = await upsertCommissionRule(req.body, req.user.username); return res.status(201).json({ rule: r }) }
    if (req.method === 'DELETE') { await deleteCommissionRule(req.body.id, req.user.username); return res.status(200).json({ success: true }) }
  }

  if (req.method === 'GET') {
    const { employeeId, year, month, status, page, limit } = req.query
    const data = await getCommissions({ employeeId, year, month, status,
      page: parseInt(page) || 1, limit: parseInt(limit) || 50 })
    return res.status(200).json(data)
  }

  if (req.method === 'POST') {
    if (req.body.markPaid) {
      const { ids, paymentRef } = req.body
      if (!ids?.length) return res.status(400).json({ error: 'ids required' })
      await markCommissionsPaid(ids, paymentRef, req.user.username)
      return res.status(200).json({ success: true })
    }
    const c = await addCommissionAdjustment(req.body, req.user.username)
    return res.status(201).json({ commission: c })
  }

  return res.status(405).end()
}

export default requireAuth(handler, 'admin')
