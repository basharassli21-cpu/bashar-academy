import { requireAuth } from '../../../lib/auth'
import { hashPassword } from '../../../lib/db'
import {
  createSaleRecord, getSaleRecords, getSaleRecordById,
  getEmployeeByUsername, normalizeJordanPhone, getSaleRecordByDuplicate,
} from '../../../lib/sales-db'
import { getUser, createUser } from '../../../lib/users-store'

// Normalize a Jordanian phone to the local format 0XXXXXXXXX
function cleanPhone(raw) {
  return normalizeJordanPhone(raw)
}

// Auto-create (or find) a student account from a normalized phone number.
// Returns { username, created: bool, existing: bool }
async function ensureStudentAccount(normalizedPhone, studentName, packageName) {
  const existingUser = await getUser(normalizedPhone)
  if (existingUser) {
    return { username: normalizedPhone, created: false, existing: true }
  }

  const packageToAllowedCourse = { elite: 'elite', professional: 'professional', starter: 'professional' }
  const allowedCourse = packageToAllowedCourse[packageName] || 'professional'

  const passwordHash = await hashPassword(normalizedPhone)
  const initials = studentName.split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase()

  await createUser(normalizedPhone, {
    name: studentName.trim(),
    avatar: initials || 'ط',
    role: 'student',
    passwordHash,
    allowedCourse,
    subscriptionType: 'permanent',
    requires_password_change: true,
  })

  // Set requires_password_change flag (column added by migrate-sale-records.js)
  try {
    const { neon } = await import('@neondatabase/serverless')
    const sql = neon(process.env.DATABASE_URL || process.env.POSTGRES_URL)
    await sql`UPDATE app_users SET requires_password_change = TRUE WHERE username = ${normalizedPhone}`
  } catch { /* best-effort */ }

  return { username: normalizedPhone, created: true, existing: false }
}

async function handler(req, res) {
  // ── GET ──────────────────────────────────────────────────────────────────
  if (req.method === 'GET') {
    const { employeeId, year, month, page, limit } = req.query

    // Employee can only see their own records
    if (req.user.role === 'employee') {
      const employee = await getEmployeeByUsername(req.user.username)
      if (!employee) return res.status(404).json({ error: 'الموظف غير موجود' })
      const data = await getSaleRecords({
        employeeId: employee.id, year, month,
        page: parseInt(page) || 1, limit: parseInt(limit) || 50,
      })
      return res.status(200).json(data)
    }

    // Admin can filter by employeeId or get all
    const data = await getSaleRecords({
      employeeId: employeeId ? parseInt(employeeId) : null,
      year, month,
      page: parseInt(page) || 1, limit: parseInt(limit) || 50,
    })
    return res.status(200).json(data)
  }

  // ── PATCH — update sale status/amount ────────────────────────────────────
  if (req.method === 'PATCH') {
    const { id } = req.query
    if (!id) return res.status(400).json({ error: 'id مطلوب' })
    const { updateSaleRecord } = await import('../../../lib/sales-db')
    let employeeId
    if (req.user.role === 'admin') {
      employeeId = null
    } else {
      const employee = await getEmployeeByUsername(req.user.username)
      if (!employee) return res.status(404).json({ error: 'الموظف غير موجود' })
      employeeId = employee.id
    }
    const { saleStatus, amountPaid, deposit, paymentMethod } = req.body || {}
    const record = await updateSaleRecord(parseInt(id), employeeId, { saleStatus, amountPaid, deposit, paymentMethod })
    if (!record) return res.status(404).json({ error: 'السجل غير موجود' })
    return res.status(200).json({ record })
  }

  // ── POST ─────────────────────────────────────────────────────────────────
  if (req.method === 'POST') {
    try {
    const { studentName, studentPhone, packageName, notes, proofImageUrl, amountPaid, deposit, paymentMethod, saleStatus } = req.body || {}

    if (!studentName?.trim()) return res.status(400).json({ error: 'اسم الطالب مطلوب' })
    if (!studentPhone?.trim()) return res.status(400).json({ error: 'رقم الهاتف مطلوب' })
    if (!packageName) return res.status(400).json({ error: 'الباقة مطلوبة' })
    if (!proofImageUrl) return res.status(400).json({ error: 'صورة الإثبات مطلوبة' })

    const validPackages = ['elite', 'professional', 'starter']
    if (!validPackages.includes(packageName)) return res.status(400).json({ error: 'باقة غير صالحة' })

    const normalized = cleanPhone(studentPhone)
    if (!normalized) return res.status(400).json({ error: 'رقم الهاتف غير صالح — يجب أن يكون أردنياً (077/078/079)' })

    // Resolve employee ID
    let employeeId
    if (req.user.role === 'admin') {
      const { employeeId: eid } = req.body || {}
      employeeId = eid ? parseInt(eid) : null
      if (!employeeId) return res.status(400).json({ error: 'employeeId مطلوب للأدمن' })
    } else {
      const employee = await getEmployeeByUsername(req.user.username)
      if (!employee) return res.status(404).json({ error: 'الموظف غير موجود' })
      employeeId = employee.id
    }

    // Check for duplicate (same employee, same phone, today)
    const today = new Date().toISOString().split('T')[0]
    const duplicate = await getSaleRecordByDuplicate(employeeId, normalized, today)
    if (duplicate) {
      return res.status(409).json({
        error: 'هذه البيعة مسجلة مسبقاً اليوم لنفس الرقم',
        existing: duplicate,
      })
    }

    // Create student account
    const accountResult = await ensureStudentAccount(normalized, studentName, packageName)

    // Create sale record
    const record = await createSaleRecord({
      employeeId, studentName, studentPhone, packageName, notes, proofImageUrl,
      studentUsername: accountResult.username,
      studentAccountCreated: accountResult.created,
      studentAccountExisting: accountResult.existing,
      amountPaid: amountPaid ? parseFloat(amountPaid) : null,
      deposit: deposit ? parseFloat(deposit) : null,
      paymentMethod: paymentMethod || 'bank_transfer',
      saleStatus: saleStatus || 'paid',
    })

    // Auto-sync to finance (best-effort — never blocks CRM sale)
    try {
      const { createSale: createFinSale } = await import('../../../lib/finance-db')
      const PAY_MAP = { bank_transfer:'bank', cash:'cash', cliq:'bank', other:'manual' }
      const PKG_NAME = { elite:'Elite — الباقة الكاملة', professional:'Professional — الباقة المتوسطة', starter:'Starter — باقة التنفيذ' }
      const total   = amountPaid  ? parseFloat(amountPaid)  : 0
      const dep     = deposit     ? parseFloat(deposit)     : 0
      const status  = saleStatus === 'cancelled' ? 'cancelled'
                    : saleStatus === 'paid'       ? 'paid'
                    : dep > 0                     ? 'partial' : 'pending'
      await createFinSale({
        customerName:  studentName.trim(),
        customerPhone: normalized,
        employeeId,
        productType:   'course',
        productName:   PKG_NAME[packageName] || packageName,
        total,
        amountPaid:    dep || undefined,
        paymentMethod: PAY_MAP[paymentMethod] || 'bank',
        paymentStatus: status,
        currency:      'JOD',
        source:        'crm',
        notes:         notes || null,
        saleDate:      new Date().toISOString().split('T')[0],
      }, req.user.username)
    } catch (fe) {
      console.error('[sale POST] finance sync failed:', fe.message)
    }

    return res.status(201).json({
      record,
      studentAccount: {
        username: accountResult.username,
        password: normalized,
        created: accountResult.created,
        existing: accountResult.existing,
        studentName: studentName.trim(),
      },
    })
    } catch (e) {
      console.error('[sale POST]', e.message)
      return res.status(500).json({ error: e.message || 'خطأ في تسجيل البيعة' })
    }
  }

  return res.status(405).end()
}

export default requireAuth(handler)
