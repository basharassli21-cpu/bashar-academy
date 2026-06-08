// pages/api/lessons/[id]/video.js
// هذا الملف هو قلب الحماية — الفيديو لا يُعطى إلا بعد التحقق

import { requireAuth } from '../../../../lib/auth'
import { LESSONS, USERS } from '../../../../lib/db'

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

  // التحقق من الوصول:
  // 1. الدرس مجاني = الكل يشوفه
  // 2. الأدمن يشوف الكل
  // 3. الطالب: يجب أن يكمل الدرس السابق أولاً
  const isAdmin = req.user.role === 'admin'
  const isFree = lesson.free
  const prevLesson = LESSONS.find(l => l.id === lessonId - 1)
  const prevCompleted = !prevLesson || (user.progress && user.progress[prevLesson.id])

  if (!isAdmin && !isFree && !prevCompleted) {
    return res.status(403).json({
      error: 'يجب إكمال الدرس السابق أولاً',
      requiredLesson: prevLesson?.id
    })
  }

  // ======================================================
  // هنا تضع رابط الفيديو الحقيقي
  // خيارات موصى بها:
  // 1. Bunny.net (الأفضل للعرب - CDN سريع وأرخص)
  // 2. Cloudflare R2 + Stream
  // 3. Vimeo Pro (private videos)
  //
  // المثال: رابط Bunny.net المؤقت (signed URL - ينتهي بعد ساعة)
  // ======================================================

  // في الحال: رابط تجريبي
  // في الإنتاج: استبدل بـ signed URL من خدمة الاستضافة
  const videoUrls = {
    1: process.env.VIDEO_1_URL || 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
    2: process.env.VIDEO_2_URL || 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
    3: process.env.VIDEO_3_URL || 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
    4: process.env.VIDEO_4_URL || 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
    5: process.env.VIDEO_5_URL || 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
  }

  const videoUrl = videoUrls[lessonId]

  // سجّل الوصول (مفيد للمراقبة)
  console.log(`[VIDEO ACCESS] User: ${req.user.username} | Lesson: ${lessonId} | Time: ${new Date().toISOString()}`)

  return res.status(200).json({
    videoUrl,
    lessonId,
    // watermark info للعرض في الفيديو
    watermark: {
      text: `${req.user.username} | ${new Date().toLocaleDateString('ar')}`,
      username: req.user.username
    }
  })
}

export default requireAuth(handler)
