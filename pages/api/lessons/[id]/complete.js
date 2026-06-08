// pages/api/lessons/[id]/complete.js
import { requireAuth } from '../../../../lib/auth'
import { USERS, LESSONS } from '../../../../lib/db'

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const lessonId = parseInt(req.query.id)
  const lesson = LESSONS.find(l => l.id === lessonId)

  if (!lesson) {
    return res.status(404).json({ error: 'الدرس غير موجود' })
  }

  const user = USERS[req.user.username]
  if (!user) {
    return res.status(401).json({ error: 'مستخدم غير موجود' })
  }

  // تحديث التقدم
  if (!user.progress) user.progress = {}
  user.progress[lessonId] = true

  const completed = Object.values(user.progress).filter(Boolean).length
  const total = LESSONS.length
  const percentage = Math.round((completed / total) * 100)

  return res.status(200).json({
    success: true,
    progress: user.progress,
    stats: { completed, total, percentage }
  })
}

export default requireAuth(handler)
