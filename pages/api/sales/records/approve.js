import { requireAuth } from '../../../../lib/auth'
import { hashPassword } from '../../../../lib/db'
import { approveSaleRecord, rejectSaleRecord, getSaleRecordById, normalizeJordanPhone } from '../../../../lib/sales-db'
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
      const { createSale: createFinSale } = await import('../../../../lib/finance-db')
      const PAY_MAP = { bank_transfer:'bank', cash:'cash', cliq:'bank', other:'manual' }
      const PKG_NAME = { elite:'Elite — الباقة الكاملة', professional:'Professional — الباقة المتوسطة', starter:'Starter — باقة التنفيذ' }
      const total  = sale.amount_paid  ? parseFloat(sale.amount_paid)  : 0
      const dep    = sale.deposit      ? parseFloat(sale.deposit)      : 0
      const status = sale.sale_status === 'cancelled' ? 'cancelled'
                   : sale.sale_status === 'paid'       ? 'paid'
                   : dep > 0                           ? 'partial' : 'pending'
      await createFinSale({
        customerName:  sale.student_name.trim(),
        customerPhone: normalized,
        employeeId:    sale.employee_id,
        productType:   'course',
        productName:   PKG_NAME[sale.package_name] || sale.package_name,
        total,
        amountPaid:    dep || undefined,
        paymentMethod: PAY_MAP[sale.payment_method] || 'bank',
        paymentStatus: status,
        currency:      'JOD',
        source:        'crm',
        notes:         sale.notes || null,
        saleDate:      sale.sale_date || new Date().toISOString().split('T')[0],
      }, req.user.username)
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
