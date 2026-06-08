import { requireAuth } from '../../../../lib/auth'
import { LESSONS, COURSES } from '../../../../lib/db'
import { getUser } from '../../../../lib/users-store'

async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const lessonId = parseInt(req.query.id)
  const lesson = LESSONS.find(l => l.id === lessonId)
  if (!lesson) return res.status(404).json({ error: 'الدرس غير موجود' })

  const user = await getUser(req.user.username)
  if (!user) return res.status(401).json({ error: 'مستخدم غير موجود' })

  const isAdmin = req.user.role === 'admin'

  if (!isAdmin) {
    const course = user.allowedCourse ? COURSES[user.allowedCourse] : null
    const inCourse = course && course.lessons.includes(lessonId)
    if (!inCourse && !lesson.free) {
      return res.status(403).json({ error: 'ليس لديك صلاحية الوصول لهذا الدرس' })
    }

    const prevLesson = LESSONS.find(l => l.id === lessonId - 1)
    const prevCompleted = !prevLesson || (user.progress && user.progress[prevLesson.id])
    if (!lesson.free && !prevCompleted) {
      return res.status(403).json({ error: 'يجب إكمال الدرس السابق أولاً', requiredLesson: prevLesson?.id })
    }
  }

  console.log(`[VIDEO] ${req.user.username} | lesson ${lessonId} | ${new Date().toISOString()}`)

  return res.status(200).json({
    videoUrl: lesson.videoUrl,
    lessonId,
    watermark: {
      text: `${req.user.username} | ${new Date().toLocaleDateString('ar')}`,
      username: req.user.username
    }
  })
}

export default requireAuth(handler)
