import { requireAuth } from '../../../../lib/auth'
import { LESSONS, USERS, COURSES } from '../../../../lib/db'

async function handler(req, res) {
  if (req.method !== 'GET') {
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

  const isAdmin = req.user.role === 'admin'

  // Check course access
  if (!isAdmin) {
    const allowedCourse = user.allowedCourse
    const course = allowedCourse ? COURSES[allowedCourse] : null
    const courseHasLesson = course && course.lessons.includes(lessonId)
    if (!courseHasLesson && !lesson.free) {
      return res.status(403).json({ error: 'ليس لديك صلاحية الوصول لهذا الدرس' })
    }

    // Sequential unlock: must complete previous lesson
    const prevLesson = LESSONS.find(l => l.id === lessonId - 1)
    const prevCompleted = !prevLesson || (user.progress && user.progress[prevLesson.id])
    if (!lesson.free && !prevCompleted) {
      return res.status(403).json({
        error: 'يجب إكمال الدرس السابق أولاً',
        requiredLesson: prevLesson?.id
      })
    }
  }

  const videoUrl = lesson.videoUrl

  console.log(`[VIDEO] User: ${req.user.username} | Lesson: ${lessonId} | ${new Date().toISOString()}`)

  return res.status(200).json({
    videoUrl,
    lessonId,
    watermark: {
      text: `${req.user.username} | ${new Date().toLocaleDateString('ar')}`,
      username: req.user.username
    }
  })
}

export default requireAuth(handler)
