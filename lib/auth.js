// lib/auth.js
import jwt from 'jsonwebtoken'
import { parse, serialize } from 'cookie'
import { getUser } from './users-store'

if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET env var is required')
const JWT_SECRET  = process.env.JWT_SECRET
const COOKIE_NAME = 'ba_session'
const MAX_AGE     = 60 * 60 * 24 * 7 // 7 days

// [L1] Each token carries a unique ID — groundwork for future per-session revocation
export function createToken(payload) {
  return jwt.sign(
    { ...payload, jti: crypto.randomUUID() },
    JWT_SECRET,
    { expiresIn: MAX_AGE }
  )
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch {
    return null
  }
}

export function setSessionCookie(res, token) {
  const cookie = serialize(COOKIE_NAME, token, {
    httpOnly:  true,
    secure:    process.env.NODE_ENV === 'production',
    sameSite:  'strict',
    maxAge:    MAX_AGE,
    path:      '/',
  })
  res.setHeader('Set-Cookie', cookie)
}

export function clearSessionCookie(res) {
  const cookie = serialize(COOKIE_NAME, '', {
    httpOnly:  true,
    secure:    process.env.NODE_ENV === 'production',
    sameSite:  'strict',
    maxAge:    0,
    path:      '/',
  })
  res.setHeader('Set-Cookie', cookie)
}

export function getSessionFromRequest(req) {
  const cookies = parse(req.headers.cookie || '')
  const token   = cookies[COOKIE_NAME]
  if (!token) return null
  return verifyToken(token)
}

// [H2] Invalidate old sessions after password change — applied centrally to every route.
//      Returns true (fresh) if the check cannot be performed (store unavailable).
async function checkSessionFreshness(session) {
  if (!session?.username || session.role === 'employee') return true

  try {
    const user = await getUser(session.username)
    if (!user?.passwordChangedAt || !session.iat) return true
    const changedAt = Math.floor(new Date(user.passwordChangedAt).getTime() / 1000)
    return changedAt <= session.iat
  } catch {
    // User store temporarily unavailable (e.g. Blob blocked/outage).
    // Fail open so the rest of the app stays functional.
    return true
  }
}

export function requireAuth(handler, requiredRole = null) {
  return async (req, res) => {
    const session = getSessionFromRequest(req)

    if (!session) {
      return res.status(401).json({ error: 'غير مسجل دخول' })
    }

    if (requiredRole && session.role !== requiredRole) {
      return res.status(403).json({ error: 'صلاحيات غير كافية' })
    }

    // [H2] Reject tokens issued before the last password change
    const fresh = await checkSessionFreshness(session)
    if (!fresh) {
      return res.status(401).json({ error: 'انتهت الجلسة — سجّل دخولك مجدداً' })
    }

    req.user = session
    return handler(req, res)
  }
}
