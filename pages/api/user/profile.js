import { requireAuth } from '../../../lib/auth'
import { updateUser, getUser } from '../../../lib/users-store'
import { verifyPassword, hashPassword } from '../../../lib/db'

async function handler(req, res) {
  if (req.method !== 'PUT') return res.status(405).json({ error: 'Method not allowed' })

  const { name, phone, gender, photo, currentPassword, newPassword } = req.body

  // Password change flow
  if (currentPassword !== undefined || newPassword !== undefined) {
    if (!currentPassword || !newPassword) return res.status(400).json({ error: 'يرجى إدخال كلمة المرور الحالية والجديدة' })
    if (newPassword.length < 6) return res.status(400).json({ error: 'كلمة المرور الجديدة: 6 أحرف على الأقل' })
    const user = await getUser(req.user.username)
    const valid = await verifyPassword(currentPassword, user?.passwordHash || '')
    if (!valid) return res.status(401).json({ error: 'كلمة المرور الحالية خاطئة' })
    const passwordHash = await hashPassword(newPassword)
    await updateUser(req.user.username, { passwordHash })
    return res.status(200).json({ success: true })
  }

  // Validate photo: must be a base64 data URL and < 150KB encoded
  if (photo !== undefined) {
    if (photo !== '' && !photo.startsWith('data:image/')) {
      return res.status(400).json({ error: 'صيغة الصورة غير صحيحة' })
    }
    if (photo.length > 200_000) {
      return res.status(400).json({ error: 'الصورة كبيرة جداً، يرجى اختيار صورة أصغر' })
    }
  }

  const updates = {}
  if (name && typeof name === 'string' && name.trim()) updates.name = name.trim()
  if (typeof phone === 'string') updates.phone = phone.trim()
  if (gender === 'male' || gender === 'female' || gender === '') updates.gender = gender
  if (photo !== undefined) updates.photo = photo   // '' clears it

  await updateUser(req.user.username, updates)
  return res.status(200).json({ success: true })
}

export default requireAuth(handler)
