import { requireAuth } from '../../../lib/auth'
import { updateUser } from '../../../lib/users-store'

async function handler(req, res) {
  if (req.method !== 'PUT') return res.status(405).json({ error: 'Method not allowed' })

  const { name, phone, gender, photo } = req.body

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
