import { requireAuth } from '../../../../lib/auth'
import { LESSONS, COURSES } from '../../../../lib/db'
import { getUser } from '../../../../lib/users-store'
import { presignR2 } from '../../../../lib/r2-presign'

const CDN_PREFIX = 'https://cdn.coachbasharalasali.com/'

async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const lessonId = parseInt(req.query.id)
  const lesson   = LESSONS.find(l => l.id === lessonId)
  if (!lesson) return res.status(404).json({ error: 'الدرس غير موجود' })

  const user = await getUser(req.user.username)
  if (!user) return res.status(401).json({ error: 'مستخدم غير موجود' })

  if (user.softDeleted) {
    return res.status(403).json({ error: 'هذا الحساب معطّل. تواصل مع الإدارة.' })
  }

  // passwordChangedAt check is now handled centrally in requireAuth (lib/auth.js H2),
  // so it does not need to be repeated here.

  if (user.subscriptionType === 'monthly' && user.subscriptionExpiry) {
    if (new Date(user.subscriptionExpiry) < new Date()) {
      return res.status(403).json({ error: 'انتهت صلاحية اشتراكك. تواصل مع الإدارة للتجديد.' })
    }
  }

  const isAdmin = req.user.role === 'admin'

  if (!isAdmin) {
    const course   = user.allowedCourse ? COURSES[user.allowedCourse] : null
    const inCourse = course && course.lessons.includes(lessonId)
    if (!inCourse && !lesson.free) {
      return res.status(403).json({ error: 'ليس لديك صلاحية الوصول لهذا الدرس' })
    }

    const prevLesson    = LESSONS.find(l => l.id === lessonId - 1)
    const prevCompleted = !prevLesson || (user.progress && user.progress[prevLesson.id])
    if (!lesson.free && !prevCompleted) {
      return res.status(403).json({ error: 'يجب إكمال الدرس السابق أولاً', requiredLesson: prevLesson?.id })
    }
  }

  // [M4] Presigned URLs — 4-hour expiry so the link can't be shared indefinitely.
  //      Falls back to the public R2 URL if R2 private credentials are not yet configured.
  //      To enable: set R2_ENDPOINT, R2_BUCKET, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY
  //      in .env.local and switch the R2 bucket to private in the Cloudflare dashboard.
  const objectKey = lesson.videoUrl.replace(CDN_PREFIX, '')

  // [L3] R2 public URL no longer hardcoded — read from env var only
  const R2_PUBLIC = process.env.R2_PUBLIC_URL
  const signed    = presignR2(objectKey, 4 * 3600)
  const videoUrl  = signed ?? (R2_PUBLIC ? `${R2_PUBLIC}/${objectKey}` : lesson.videoUrl)

  console.log(`[VIDEO] ${req.user.username} | lesson ${lessonId} | signed=${!!signed} | ${new Date().toISOString()}`)

  return res.status(200).json({
    videoUrl,
    lessonId,
    watermark: {
      text:     `${req.user.username} | ${new Date().toLocaleDateString('ar')}`,
      username: req.user.username,
    },
  })
}

export default requireAuth(handler)
