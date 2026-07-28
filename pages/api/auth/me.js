import { getSessionFromRequest } from '../../../lib/auth'
import { getUser } from '../../../lib/users-store'

export default async function handler(req, res) {
  const session = getSessionFromRequest(req)
  if (!session) return res.status(401).json({ error: 'غير مسجل' })

  const user = await getUser(session.username)
  if (!user) return res.status(401).json({ error: 'مستخدم غير موجود' })

  // Block soft-deleted (suspended) accounts
  if (user.softDeleted) {
    return res.status(403).json({ error: 'هذا الحساب معطّل. تواصل مع الإدارة.' })
  }

  // Block expired monthly subscriptions
  if (user.subscriptionType === 'monthly' && user.subscriptionExpiry) {
    if (new Date(user.subscriptionExpiry) < new Date()) {
      return res.status(403).json({ error: 'انتهت صلاحية اشتراكك. تواصل مع الإدارة للتجديد.' })
    }
  }

  // Invalidate sessions created before the last password change
  if (user.passwordChangedAt && session.iat) {
    const changedAt = Math.floor(new Date(user.passwordChangedAt).getTime() / 1000)
    if (changedAt > session.iat) {
      return res.status(401).json({ error: 'انتهت الجلسة — سجّل دخولك مجدداً' })
    }
  }

  return res.status(200).json({
    username: session.username,
    name: user.name,
    role: user.role,
    avatar: user.avatar,
    progress: user.progress || {},
    quizScores: user.quizScores || {},
    joinedAt: user.joinedAt,
    subscriptionType: user.subscriptionType || 'permanent',
    subscriptionExpiry: user.subscriptionExpiry || null,
  })
}
