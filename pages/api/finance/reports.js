import { requireAuth } from '../../../lib/auth'
import { getPLReport, getCashFlowReport, getAuditLog, getAccounts, getJournalEntries, getBalanceSheet, getTrialBalance, getAccountStatement } from '../../../lib/finance-db'

async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()

  const { type, dateFrom, dateTo, year, month, page, limit, asOfDate } = req.query

  try {
    if (type === 'pl')            return res.status(200).json(await getPLReport({ dateFrom, dateTo }))
    if (type === 'cashflow')      return res.status(200).json(await getCashFlowReport({ year, month }))
    if (type === 'audit')         return res.status(200).json(await getAuditLog({ page: parseInt(page)||1, limit: parseInt(limit)||50 }))
    if (type === 'accounts')      return res.status(200).json({ accounts: await getAccounts() })
    if (type === 'balance_sheet') return res.status(200).json(await getBalanceSheet({ asOfDate }))
    if (type === 'trial_balance') return res.status(200).json(await getTrialBalance({ dateFrom, dateTo }))
    if (type === 'account_statement') {
      const { accountCode } = req.query
      if (!accountCode) return res.status(400).json({ error: 'accountCode required' })
      const stmt = await getAccountStatement({ accountCode, dateFrom, dateTo })
      if (!stmt) return res.status(404).json({ error: 'Account not found' })
      return res.status(200).json(stmt)
    }
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
