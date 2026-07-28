import { neon } from '@neondatabase/serverless'
import { createToken, setSessionCookie } from '../../../lib/auth'
import { verifyPassword } from '../../../lib/db'
import { getUser, updateUser } from '../../../lib/users-store'
import {
  getEmployeeByUsername, employeeAvatar,
  getEmployeeLockStatus, incrementLoginFailures, resetLoginFailures,
} from '../../../lib/sales-db'

const sql = neon(process.env.DATABASE_URL || process.env.POSTGRES_URL)

// [M1] Extract the actual client IP — take only the first entry so it can't be
//       trivially spoofed by appending extra values to X-Forwarded-For.
function getClientIp(req) {
  const fwd = req.headers['x-forwarded-for']
  if (fwd) return fwd.split(',')[0].trim()
  return req.headers['x-real-ip'] || req.socket?.remoteAddress || 'unknown'
}

// [H1] Persistent rate limiting via Postgres — survives serverless cold starts
//       and is shared across all Lambda instances.
//       Falls back to in-memory if the table hasn't been migrated yet.
const _memAttempts = new Map()

async function checkRateLimit(ip) {
  try {
    const window = new Date(Math.floor(Date.now() / 60000) * 60000).toISOString()
    const [row] = await sql`
      INSERT INTO login_rate_limit (ip, window_start, attempts)
      VALUES (${ip}, ${window}, 1)
      ON CONFLICT (ip, window_start)
      DO UPDATE SET attempts = login_rate_limit.attempts + 1
      RETURNING attempts
    `
    // Probabilistic cleanup — keeps the table lean without a dedicated job
    if (Math.random() < 0.01) {
      sql`DELETE FROM login_rate_limit WHERE window_start < NOW() - INTERVAL '10 minutes'`
        .catch(() => {})
    }
    return row.attempts <= 10
  } catch {
    // Table not yet migrated — fall back to in-memory temporarily.
    // Run: node --env-file=.env.local scripts/migrate-rate-limit.js
    const now = Date.now()
    const a   = _memAttempts.get(ip) || { count: 0, resetAt: now + 60000 }
    if (now > a.resetAt) { a.count = 0; a.resetAt = now + 60000 }
    a.count++
    _memAttempts.set(ip, a)
    return a.count <= 10
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const ip = getClientIp(req)
  if (!await checkRateLimit(ip)) {
    return res.status(429).json({ error: 'محاولات كثيرة. انتظر دقيقة.' })
  }

  const { username, password } = req.body
  if (!username || !password) return res.status(400).json({ error: 'يرجى إدخال جميع البيانات' })
  if (typeof username !== 'string' || username.length > 50) return res.status(400).json({ error: 'بيانات غير صحيحة' })

  const usernameNorm = username.toLowerCase().trim()
  const employee     = await getEmployeeByUsername(usernameNorm)

  if (employee) {
    const lockStatus = await getEmployeeLockStatus(employee.id)
    if (lockStatus.locked) {
      const until      = new Date(lockStatus.lockedUntil)
      const minutesLeft = Math.ceil((until - Date.now()) / 60000)
      return res.status(423).json({ error: `الحساب مقفل مؤقتاً. حاول بعد ${minutesLeft} دقيقة.` })
    }
    const valid = await verifyPassword(password, employee.password_hash)
    if (!valid) {
      await incrementLoginFailures(employee.id)
      return res.status(401).json({ error: 'اسم المستخدم أو كلمة المرور خاطئة' })
    }
    await resetLoginFailures(employee.id)
    const token = createToken({
      username: employee.username,
      name:     employee.name,
      role:     'employee',
      avatar:   employeeAvatar(employee.name),
    })
    setSessionCookie(res, token)
    return res.status(200).json({
      success: true,
      user: { username: employee.username, name: employee.name, role: 'employee', avatar: employeeAvatar(employee.name) },
    })
  }

  const user      = await getUser(usernameNorm)
  const dummyHash = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LnU0Q0y/lS6'
  const hashToCheck = user ? user.passwordHash : dummyHash
  const valid       = await verifyPassword(password, hashToCheck)

  if (!user || !valid) return res.status(401).json({ error: 'اسم المستخدم أو كلمة المرور خاطئة' })

  if (user.softDeleted) {
    return res.status(403).json({ error: 'هذا الحساب معطّل. تواصل مع الإدارة.' })
  }

  if (user.subscriptionType === 'monthly' && user.subscriptionExpiry) {
    if (new Date(user.subscriptionExpiry) < new Date()) {
      return res.status(403).json({ error: 'انتهت صلاحية اشتراكك. تواصل مع الإدارة للتجديد.' })
    }
  }

  const token = createToken({
    username: usernameNorm,
    name:     user.name,
    role:     user.role,
    avatar:   user.avatar,
  })

  setSessionCookie(res, token)

  updateUser(usernameNorm, { lastLoginAt: new Date().toISOString() })
    .catch(err => console.error('[login] updateUser failed:', err.message))

  return res.status(200).json({
    success: true,
    user: { username: usernameNorm, name: user.name, role: user.role, avatar: user.avatar },
  })
}
