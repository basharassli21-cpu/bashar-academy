// pages/api/lessons/index.js
import { requireAuth } from '../../../lib/auth'
import { LESSONS } from '../../../lib/db'

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // الطالب يشوف كل الدروس لكن الفيديو محمي
  const lessons = LESSONS.map(l => ({
    id: l.id,
    title: l.title,
    titleEn: l.titleEn,
    duration: l.duration,
    durationEn: l.durationEn,
    desc: l.desc,
    descEn: l.descEn,
    free: l.free,
    thumbnail: l.thumbnail
    // videoUrl مش مرسلة هنا - تُطلب بشكل منفصل عند الدخول على الدرس
  }))

  return res.status(200).json({ lessons })
}

export default requireAuth(handler)
