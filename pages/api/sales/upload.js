import { requireAuth } from '../../../lib/auth'
import { put } from '@vercel/blob'

// Accepts base64-encoded file data + MIME type, uploads to Vercel Blob.
// Body: { base64: string, contentType: string, filename: string }
async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  if (!['admin', 'employee'].includes(req.user.role))
    return res.status(403).json({ error: 'غير مسموح' })

  const { base64, contentType, filename } = req.body || {}
  if (!base64 || !contentType) return res.status(400).json({ error: 'base64 and contentType required' })

  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
  if (!allowed.includes(contentType)) return res.status(400).json({ error: 'نوع الملف غير مدعوم' })

  const buffer = Buffer.from(base64, 'base64')
  if (buffer.length > 10 * 1024 * 1024) return res.status(400).json({ error: 'حجم الصورة يجب أن يكون أقل من 10MB' })

  const ext = contentType.split('/')[1].replace('jpeg', 'jpg')
  const safeName = `sale-proofs/${Date.now()}-${req.user.username}.${ext}`

  try {
    const { url } = await put(safeName, buffer, { access: 'private', contentType })
    return res.status(200).json({ url })
  } catch (e) {
    console.error('[upload] blob error:', e.message)
    return res.status(500).json({ error: 'فشل رفع الصورة: ' + e.message })
  }
}

export default requireAuth(handler)
