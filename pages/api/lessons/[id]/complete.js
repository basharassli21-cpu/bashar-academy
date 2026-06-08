import { requireAuth } from '../../../../lib/auth'
import { LESSONS } from '../../../../lib/db'
import { getUser, updateUser } from '../../../../lib/users-store'

async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const lessonId = parseInt(req.query.id)
  const lesson = LESSONS.find(l => l.id === lessonId)
  if (!lesson) return res.status(404).json({ error: 'الدرس غير موجود' })

  const user = await getUser(req.user.username)
  if (!user) return res.status(401).json({ error: 'مستخدم غير موجود' })

  const progress = { ...(user.progress || {}), [lessonId]: true }
  await updateUser(req.user.username, { progress })

  const completed = Object.values(progress).filter(Boolean).length
  const total = LESSONS.length
  const percentage = Math.round((completed / total) * 100)

  return res.status(200).json({
    success: true,
    progress,
    stats: { completed, total, percentage }
  })
}

export default requireAuth(handler)
