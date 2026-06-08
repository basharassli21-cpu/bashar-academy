import { requireAuth } from '../../../lib/auth'
import { USERS, hashPassword } from '../../../lib/db'

const VALID_COURSES = ['comprehensive', 'intermediate', 'basic']

async function handler(req, res) {

  if (req.method === 'GET') {
    const students = Object.entries(USERS)
      .filter(([, u]) => u.role === 'student')
      .map(([username, u]) => ({
        username,
        name: u.name,
        avatar: u.avatar,
        progress: u.progress || {},
        quizScores: u.quizScores || {},
        allowedCourse: u.allowedCourse || null,
        joinedAt: u.joinedAt
      }))
    return res.status(200).json({ students })
  }

  if (req.method === 'POST') {
    const { username, password, name, allowedCourse } = req.body

    if (!username || !password || !name) {
      return res.status(400).json({ error: 'يرجى ملء جميع الحقول' })
    }
    if (!allowedCourse || !VALID_COURSES.includes(allowedCourse)) {
      return res.status(400).json({ error: 'يرجى اختيار الدورة المسموح بها' })
    }
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
      return res.status(400).json({ error: 'اسم المستخدم: أحرف إنجليزية وأرقام فقط، 3-20 حرف' })
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'كلمة المرور: 6 أحرف على الأقل' })
    }
    if (USERS[username]) {
      return res.status(409).json({ error: 'اسم المستخدم موجود مسبقاً' })
    }

    const passwordHash = await hashPassword(password)
    const initials = name.split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('')

    USERS[username] = {
      name,
      avatar: initials,
      role: 'student',
      passwordHash,
      progress: {},
      quizScores: {},
      allowedCourse,
      joinedAt: new Date().toISOString().split('T')[0]
    }

    return res.status(201).json({ success: true, student: { username, name, avatar: initials, allowedCourse } })
  }

  if (req.method === 'DELETE') {
    const { username } = req.body
    if (!username || !USERS[username]) {
      return res.status(404).json({ error: 'مستخدم غير موجود' })
    }
    if (USERS[username].role === 'admin') {
      return res.status(403).json({ error: 'لا يمكن حذف الأدمن' })
    }
    delete USERS[username]
    return res.status(200).json({ success: true })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}

export default requireAuth(handler, 'admin')
