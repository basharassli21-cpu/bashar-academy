// pages/api/auth/me.js
import { getSessionFromRequest } from '../../../lib/auth'
import { USERS } from '../../../lib/db'

export default function handler(req, res) {
  const session = getSessionFromRequest(req)

  if (!session) {
    return res.status(401).json({ error: 'غير مسجل' })
  }

  const user = USERS[session.username]
  if (!user) {
    return res.status(401).json({ error: 'مستخدم غير موجود' })
  }

  return res.status(200).json({
    username: session.username,
    name: user.name,
    role: user.role,
    avatar: user.avatar,
    progress: user.progress || {},
    quizScores: user.quizScores || {},
    joinedAt: user.joinedAt
  })
}
