import { requireAuth } from '../../../../lib/auth'
import { getUser, updateUser } from '../../../../lib/users-store'

async function handler(req, res) {
  const lessonId = parseInt(req.query.id)
  if (isNaN(lessonId)) return res.status(400).json({ error: 'معرّف الدرس غير صحيح' })

  const username = req.user.username

  // ── GET: جلب ملاحظة الدرس ──────────────────────────────────────
  if (req.method === 'GET') {
    const user = await getUser(username)
    if (!user) return res.status(404).json({ error: 'المستخدم غير موجود' })
    const note = (user.notes || {})[lessonId] || ''
    return res.status(200).json({ note })
  }

  // ── PUT: حفظ / تحديث الملاحظة ─────────────────────────────────
  if (req.method === 'PUT') {
    const { note } = req.body
    if (typeof note !== 'string') return res.status(400).json({ error: 'بيانات غير صحيحة' })
    if (note.length > 5000) return res.status(400).json({ error: 'الملاحظة طويلة جداً (الحد 5000 حرف)' })

    const user = await getUser(username)
    if (!user) return res.status(404).json({ error: 'المستخدم غير موجود' })

    const notes = { ...(user.notes || {}), [lessonId]: note }
    // إذا فارغة نحذفها لتوفير المساحة
    if (!note.trim()) delete notes[lessonId]

    await updateUser(username, { notes })
    return res.status(200).json({ success: true })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}

export default requireAuth(handler)
