// lib/auth.js
import jwt from 'jsonwebtoken'
import { parse, serialize } from 'cookie'

// ⚠️ مهم جداً: غيّر هذه القيمة لأي سلسلة عشوائية طويلة
// مثال: openssl rand -base64 32
const JWT_SECRET = process.env.JWT_SECRET || 'bashar-academy-change-this-secret-2024'
const COOKIE_NAME = 'ba_session'
const MAX_AGE = 60 * 60 * 24 * 7 // 7 أيام

export function createToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: MAX_AGE })
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
    httpOnly: true,       // JavaScript لا يقدر يقرأ الكوكي
    secure: process.env.NODE_ENV === 'production', // HTTPS فقط في production
    sameSite: 'strict',   // حماية من CSRF
    maxAge: MAX_AGE,
    path: '/'
  })
  res.setHeader('Set-Cookie', cookie)
}

export function clearSessionCookie(res) {
  const cookie = serialize(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0,
    path: '/'
  })
  res.setHeader('Set-Cookie', cookie)
}

export function getSessionFromRequest(req) {
  const cookies = parse(req.headers.cookie || '')
  const token = cookies[COOKIE_NAME]
  if (!token) return null
  return verifyToken(token)
}

// Middleware - يحمي الـ API routes
export function requireAuth(handler, requiredRole = null) {
  return async (req, res) => {
    const session = getSessionFromRequest(req)

    if (!session) {
      return res.status(401).json({ error: 'غير مسجل دخول' })
    }

    if (requiredRole && session.role !== requiredRole) {
      return res.status(403).json({ error: 'صلاحيات غير كافية' })
    }

    req.user = session
    return handler(req, res)
  }
}
