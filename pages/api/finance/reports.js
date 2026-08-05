import { requireAuth } from '../../../lib/auth'
import { getPLReport, getCashFlowReport, getAuditLog, getAccounts, getJournalEntries, getBalanceSheet, getTrialBalance, rebuildAccountBalances, resyncMissingJournals } from '../../../lib/finance-db'

async function handler(req, res) {
  // Admin maintenance actions
  if (req.method === 'POST') {
    const { action } = req.body || {}
    try {
      if (action === 'rebuild_balances') {
        const r = await rebuildAccountBalances()
        return res.status(200).json({ ok: true, ...r })
      }
      if (action === 'resync_journals') {
        const r = await resyncMissingJournals()
        return res.status(200).json({ ok: true, ...r })
      }
    } catch (e) {
      console.error('reports admin action error:', e)
      return res.status(500).json({ error: e.message })
    }
    return res.status(400).json({ error: 'unknown action' })
  }

  if (req.method !== 'GET') return res.status(405).end()

  const { type, dateFrom, dateTo, year, month, page, limit, asOfDate } = req.query

  try {
    if (type === 'pl')            return res.status(200).json(await getPLReport({ dateFrom, dateTo }))
    if (type === 'cashflow')      return res.status(200).json(await getCashFlowReport({ year, month }))
    if (type === 'audit')         return res.status(200).json(await getAuditLog({ page: parseInt(page)||1, limit: parseInt(limit)||50 }))
    if (type === 'accounts')      return res.status(200).json({ accounts: await getAccounts() })
    if (type === 'balance_sheet') return res.status(200).json(await getBalanceSheet({ asOfDate }))
    if (type === 'trial_balance') return res.status(200).json(await getTrialBalance({ dateFrom, dateTo }))
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
