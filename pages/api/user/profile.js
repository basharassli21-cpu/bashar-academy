import { requireAuth } from '../../../lib/auth'
import { updateUser, getUser } from '../../../lib/users-store'
import { verifyPassword, hashPassword } from '../../../lib/db'

async function handler(req, res) {
  if (req.method !== 'PUT') return res.status(405).json({ error: 'Method not allowed' })

  const { name, phone, gender, photo, currentPassword, newPassword } = req.body

  // Password change flow
  if (currentPassword !== undefined || newPassword !== undefined) {
    if (!currentPassword || !newPassword) return res.status(400).json({ error: 'يرجى إدخال كلمة المرور الحالية والجديدة' })
    // [M5] Minimum 8 characters (was 6)
    if (newPassword.length < 8) return res.status(400).json({ error: 'كلمة المرور الجديدة: 8 أحرف على الأقل' })
    const user  = await getUser(req.user.username)
    const valid = await verifyPassword(currentPassword, user?.passwordHash || '')
    if (!valid) return res.status(401).json({ error: 'كلمة المرور الحالية خاطئة' })
    const passwordHash = await hashPassword(newPassword)
    await updateUser(req.user.username, { passwordHash, passwordChangedAt: new Date().toISOString() })
    return res.status(200).json({ success: true })
  }

  // Validate photo: JPEG/PNG/WebP only — SVG is blocked (XSS risk via stored SVG)
  if (photo !== undefined) {
    const ALLOWED_IMG = ['data:image/jpeg', 'data:image/png', 'data:image/webp', 'data:image/gif']
    if (photo !== '' && !ALLOWED_IMG.some(t => photo.startsWith(t))) {
      return res.status(400).json({ error: 'صيغة الصورة غير مسموح بها (JPEG, PNG, WebP فقط)' })
    }
    if (photo.length > 200_000) {
      return res.status(400).json({ error: 'الصورة كبيرة جداً، يرجى اختيار صورة أصغر' })
    }
  }

  const updates = {}
  if (name && typeof name === 'string' && name.trim()) updates.name = name.trim()
  if (typeof phone === 'string') updates.phone = phone.trim()
  if (gender === 'male' || gender === 'female' || gender === '') updates.gender = gender
  if (photo !== undefined) updates.photo = photo

  await updateUser(req.user.username, updates)
  return res.status(200).json({ success: true })
}

export default requireAuth(handler)
