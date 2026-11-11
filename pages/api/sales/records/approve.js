import { requireAuth } from '../../../../lib/auth'
import { hashPassword } from '../../../../lib/db'
import { approveSaleRecord, rejectSaleRecord, getSaleRecordById, normalizeJordanPhone } from '../../../../lib/sales-db'
import { recordSaleInFinance } from '../../../../lib/sale-finance'
import { getUser, createUser } from '../../../../lib/users-store'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL || process.env.POSTGRES_URL)

async function handler(req, res) {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'غير مسموح' })
  if (req.method !== 'POST') return res.status(405).end()

  const { id, action } = req.body || {}
  if (!id) return res.status(400).json({ error: 'id مطلوب' })
  if (!['approve', 'reject'].includes(action)) return res.status(400).json({ error: 'action يجب أن يكون approve أو reject' })

  try {
    const sale = await getSaleRecordById(parseInt(id))
    if (!sale) return res.status(404).json({ error: 'البيعة غير موجودة' })
    if (sale.approval_status !== 'pending') return res.status(409).json({ error: 'هذه البيعة ليست بحالة معلقة' })

    if (action === 'reject') {
      const record = await rejectSaleRecord(parseInt(id))
      return res.status(200).json({ record })
    }

    // ── Approve: create student account then update record ────────────────
    const normalized = normalizeJordanPhone(sale.student_phone)
    if (!normalized) return res.status(400).json({ error: 'رقم الهاتف غير صالح' })

    const packageToAllowedCourse = { elite: 'elite', professional: 'professional', starter: 'starter' }
    const allowedCourse = packageToAllowedCourse[sale.package_name] || 'starter'

    const existingUser = await getUser(normalized)
    let accountCreated = false
    let accountExisting = false

    if (existingUser) {
      accountExisting = true
    } else {
      const passwordHash = await hashPassword(normalized)
      const initials = sale.student_name.split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase()
      await createUser(normalized, {
        name:         sale.student_name.trim(),
        avatar:       initials || 'ط',
        role:         'student',
        passwordHash,
        allowedCourse,
        subscriptionType: 'permanent',
      })
      // Set requires_password_change
      try {
        await sql`UPDATE app_users SET requires_password_change = TRUE WHERE username = ${normalized}`
      } catch { /* best-effort */ }
      accountCreated = true
    }

    const record = await approveSaleRecord(parseInt(id), {
      studentUsername: normalized,
      studentAccountCreated: accountCreated,
      studentAccountExisting: accountExisting,
    })

    // Finance sync (best-effort)
    try {
      await recordSaleInFinance(record, req.user.username)
    } catch (fe) {
      console.error('[approve] finance sync failed:', fe.message)
    }

    return res.status(200).json({
      record,
      studentAccount: {
        username: normalized,
        password: normalized,
        created: accountCreated,
        existing: accountExisting,
        studentName: sale.student_name.trim(),
      },
    })
  } catch (e) {
    console.error('[approve]', e.message)
    return res.status(500).json({ error: e.message })
  }
}

export default requireAuth(handler, 'admin')
