import { requireAuth } from '../../../lib/auth'
import { hashPassword, verifyPassword } from '../../../lib/db'
import { getAllUsers, createUser, deleteUser, getUser, updateUser } from '../../../lib/users-store'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL || process.env.POSTGRES_URL)

// [L2] Audit log — mirrors the pattern used in employees.js
async function writeAuditLog(actorUsername, action, targetUsername, details) {
  try {
    await sql`
      INSERT INTO admin_audit_log (actor_username, actor_role, action, target_type, target_id, details)
      VALUES (${actorUsername}, 'admin', ${action}, 'student', ${targetUsername || null}, ${JSON.stringify(details)})
    `
  } catch { /* table may not exist yet — run scripts/migrate-improvements.js */ }
}

const VALID_COURSES = ['elite', 'professional', 'starter']

async function handler(req, res) {

  if (req.method === 'GET') {
    const users    = await getAllUsers()
    const students = Object.entries(users)
      .filter(([, u]) => u.role === 'student')
      .map(([username, u]) => ({
        username,
        name:               u.name,
        avatar:             u.avatar,
        photo:              u.photo || '',
        gender:             u.gender || '',
        phone:              u.phone || '',
        progress:           u.progress || {},
        quizScores:         u.quizScores || {},
        notes:              u.notes || {},
        allowedCourse:      u.allowedCourse || null,
        joinedAt:           u.joinedAt || '',
        subscriptionType:   u.subscriptionType || 'permanent',
        subscriptionExpiry: u.subscriptionExpiry || null,
        lastLoginAt:        u.lastLoginAt || null,
        lastActiveAt:       u.lastActiveAt || null,
      }))
    return res.status(200).json({ students })
  }

  if (req.method === 'POST') {
    const { username, password, name, allowedCourse, subscriptionType, subscriptionExpiry, joinedAt } = req.body

    if (!username || !password || !name) {
      return res.status(400).json({ error: 'يرجى ملء جميع الحقول' })
    }
    const isMonthly = subscriptionType === 'monthly'
    if (!isMonthly && (!allowedCourse || !VALID_COURSES.includes(allowedCourse))) {
      return res.status(400).json({ error: 'يرجى اختيار الدورة المسموح بها' })
    }
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
      return res.status(400).json({ error: 'اسم المستخدم: أحرف إنجليزية وأرقام فقط، 3-20 حرف' })
    }
    // [M5] Minimum 8 characters for student passwords (was 6)
    if (password.length < 8) {
      return res.status(400).json({ error: 'كلمة المرور: 8 أحرف على الأقل' })
    }

    const existing = await getUser(username)
    if (existing) {
      return res.status(409).json({ error: 'اسم المستخدم موجود مسبقاً' })
    }

    const passwordHash    = await hashPassword(password)
    const initials        = name.split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('')
    const resolvedCourse  = isMonthly ? 'elite' : allowedCourse

    const userData = {
      name,
      avatar:       initials,
      role:         'student',
      passwordHash,
      progress:     {},
      quizScores:   {},
      allowedCourse: resolvedCourse,
      joinedAt:     joinedAt || new Date().toISOString().split('T')[0],
    }
    if (isMonthly) {
      userData.subscriptionType   = 'monthly'
      userData.subscriptionExpiry = subscriptionExpiry
    }

    await createUser(username.toLowerCase(), userData)
    writeAuditLog(req.user.username, 'create_student', username.toLowerCase(), { name, allowedCourse: resolvedCourse })

    return res.status(201).json({ success: true, student: { username, name, avatar: initials, allowedCourse: resolvedCourse } })
  }

  if (req.method === 'PATCH') {
    const { username, allowedCourse, action, name, newPassword, subscriptionExpiry } = req.body
    const user = await getUser(username)
    if (!username || !user) return res.status(404).json({ error: 'مستخدم غير موجود' })

    if (action === 'resetProgress') {
      await updateUser(username, { progress: {}, quizScores: {} })
      writeAuditLog(req.user.username, 'reset_student_progress', username, {})
      return res.status(200).json({ success: true })
    }
    if (action === 'editInfo') {
      const updates = {}
      if (name && name.trim()) updates.name = name.trim()
      if (newPassword) {
        // [M5] Minimum 8 characters (was 6)
        if (newPassword.length < 8) return res.status(400).json({ error: 'كلمة المرور: 8 أحرف على الأقل' })
        updates.passwordHash      = await hashPassword(newPassword)
        updates.passwordChangedAt = new Date().toISOString()
      }
      if (!updates.name && !updates.passwordHash) return res.status(400).json({ error: 'لا توجد بيانات للتحديث' })
      await updateUser(username, updates)
      writeAuditLog(req.user.username, 'edit_student_info', username, { fields: Object.keys(updates) })
      return res.status(200).json({ success: true })
    }
    if (action === 'renewSubscription') {
      const current = user.subscriptionExpiry && new Date(user.subscriptionExpiry) > new Date()
        ? new Date(user.subscriptionExpiry)
        : new Date()
      current.setDate(current.getDate() + 30)
      await updateUser(username, { subscriptionExpiry: current.toISOString().split('T')[0] })
      writeAuditLog(req.user.username, 'renew_student_subscription', username, { newExpiry: current.toISOString().split('T')[0] })
      return res.status(200).json({ success: true, subscriptionExpiry: current.toISOString().split('T')[0] })
    }
    if (!allowedCourse || !VALID_COURSES.includes(allowedCourse)) {
      return res.status(400).json({ error: 'دورة غير صالحة' })
    }
    await updateUser(username, { allowedCourse })
    writeAuditLog(req.user.username, 'change_student_course', username, { allowedCourse })
    return res.status(200).json({ success: true })
  }

  if (req.method === 'DELETE') {
    const { username } = req.body
    const user         = await getUser(username)
    if (!username || !user) {
      return res.status(404).json({ error: 'مستخدم غير موجود' })
    }
    if (user.role === 'admin') {
      return res.status(403).json({ error: 'لا يمكن حذف الأدمن' })
    }
    writeAuditLog(req.user.username, 'delete_student', username, { name: user.name })
    await deleteUser(username)
    return res.status(200).json({ success: true })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}

export default requireAuth(handler, 'admin')
