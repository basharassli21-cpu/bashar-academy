// pages/api/auth/login.js
import { USERS, verifyPassword } from '../../../lib/db'
import { createToken, setSessionCookie } from '../../../lib/auth'

// Rate limiting بسيط - منع brute force
const loginAttempts = new Map()

function checkRateLimit(ip) {
  const now = Date.now()
  const key = ip
  const attempts = loginAttempts.get(key) || { count: 0, resetAt: now + 60000 }

  if (now > attempts.resetAt) {
    attempts.count = 0
    attempts.resetAt = now + 60000
  }

  attempts.count++
  loginAttempts.set(key, attempts)

  // أكثر من 5 محاولات في دقيقة = محجوب
  return attempts.count <= 5
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Rate limiting
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown'
  if (!checkRateLimit(ip)) {
    return res.status(429).json({ error: 'محاولات كثيرة. انتظر دقيقة واحدة.' })
  }

  const { username, password } = req.body

  // Validation
  if (!username || !password) {
    return res.status(400).json({ error: 'يرجى إدخال جميع البيانات' })
  }

  if (typeof username !== 'string' || username.length > 50) {
    return res.status(400).json({ error: 'بيانات غير صحيحة' })
  }

  // التحقق من المستخدم
  const user = USERS[username.toLowerCase().trim()]

  // نفس وقت الاستجابة سواء كان المستخدم موجوداً أم لا (منع timing attacks)
  const dummyHash = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LnU0Q0y/lS6'
  const hashToCheck = user ? user.passwordHash : dummyHash
  const valid = await verifyPassword(password, hashToCheck)

  if (!user || !valid) {
    return res.status(401).json({ error: 'اسم المستخدم أو كلمة المرور خاطئة' })
  }

  // إنشاء الـ token
  const token = createToken({
    username: username.toLowerCase().trim(),
    name: user.name,
    role: user.role,
    avatar: user.avatar
  })

  setSessionCookie(res, token)

  return res.status(200).json({
    success: true,
    user: {
      username: username.toLowerCase().trim(),
      name: user.name,
      role: user.role,
      avatar: user.avatar
    }
  })
}
