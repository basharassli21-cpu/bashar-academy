import { createToken, setSessionCookie } from '../../../lib/auth'
import { verifyPassword } from '../../../lib/db'
import { getUser } from '../../../lib/users-store'
import { getEmployeeByUsername, employeeAvatar } from '../../../lib/sales-db'

const loginAttempts = new Map()

function checkRateLimit(ip) {
  const now = Date.now()
  const attempts = loginAttempts.get(ip) || { count: 0, resetAt: now + 60000 }
  if (now > attempts.resetAt) { attempts.count = 0; attempts.resetAt = now + 60000 }
  attempts.count++
  loginAttempts.set(ip, attempts)
  return attempts.count <= 10
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown'
  if (!checkRateLimit(ip)) return res.status(429).json({ error: 'محاولات كثيرة. انتظر دقيقة.' })

  const { username, password } = req.body
  if (!username || !password) return res.status(400).json({ error: 'يرجى إدخال جميع البيانات' })
  if (typeof username !== 'string' || username.length > 50) return res.status(400).json({ error: 'بيانات غير صحيحة' })

  const usernameNorm = username.toLowerCase().trim()
  const employee = await getEmployeeByUsername(usernameNorm)
  const user = employee ? null : await getUser(usernameNorm)

  const dummyHash = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LnU0Q0y/lS6'
  const hashToCheck = employee ? employee.password_hash : (user ? user.passwordHash : dummyHash)
  const valid = await verifyPassword(password, hashToCheck)

  if ((!employee && !user) || !valid) return res.status(401).json({ error: 'اسم المستخدم أو كلمة المرور خاطئة' })

  if (employee) {
    const token = createToken({ username: employee.username, name: employee.name, role: 'employee', avatar: employeeAvatar(employee.name) })
    setSessionCookie(res, token)
    return res.status(200).json({
      success: true,
      user: { username: employee.username, name: employee.name, role: 'employee', avatar: employeeAvatar(employee.name) }
    })
  }

  if (user.subscriptionType === 'monthly' && user.subscriptionExpiry) {
    const expired = new Date(user.subscriptionExpiry) < new Date()
    if (expired) return res.status(403).json({ error: 'انتهت صلاحية اشتراكك. تواصل مع الإدارة للتجديد.' })
  }

  const token = createToken({
    username: username.toLowerCase().trim(),
    name: user.name,
    role: user.role,
    avatar: user.avatar
  })

  setSessionCookie(res, token)

  // Track last login (fire-and-forget)
  import('../../../lib/users-store').then(({ updateUser }) =>
    updateUser(username.toLowerCase().trim(), { lastLoginAt: new Date().toISOString() })
  )

  return res.status(200).json({
    success: true,
    user: { username: username.toLowerCase().trim(), name: user.name, role: user.role, avatar: user.avatar }
  })
}
