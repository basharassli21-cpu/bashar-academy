import { requireAuth } from '../../../lib/auth'
import { getPLReport, getCashFlowReport, getAuditLog, getAccounts, getJournalEntries } from '../../../lib/finance-db'

async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()

  const { type, dateFrom, dateTo, year, month, page, limit } = req.query

  try {
    if (type === 'pl')        return res.status(200).json(await getPLReport({ dateFrom, dateTo }))
    if (type === 'cashflow')  return res.status(200).json(await getCashFlowReport({ year, month }))
    if (type === 'audit')     return res.status(200).json(await getAuditLog({ page: parseInt(page)||1, limit: parseInt(limit)||50 }))
    if (type === 'accounts')  return res.status(200).json({ accounts: await getAccounts() })
    if (type === 'journal') {
      return res.status(200).json(await getJournalEntries({
        dateFrom, dateTo, sourceType: req.query.sourceType,
        page: parseInt(page)||1, limit: parseInt(limit)||50,
      }))
    }
    return res.status(400).json({ error: 'invalid report type' })
  } catch (e) {
    console.error('finance/reports error:', e)
    return res.status(500).json({ error: e.message })
  }
}

export default requireAuth(handler, 'admin')
