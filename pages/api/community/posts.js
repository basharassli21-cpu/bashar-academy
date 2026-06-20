import { requireAuth } from '../../../lib/auth'
import { getPosts, createPost, deletePost, findPost } from '../../../lib/community-store'
import { getUser } from '../../../lib/users-store'

async function handler(req, res) {
  if (req.method === 'GET') {
    const posts = await getPosts()
    return res.status(200).json({ posts })
  }

  if (req.method === 'POST') {
    const { text, image } = req.body || {}
    const trimmed = (text || '').trim()
    if (!trimmed && !image) return res.status(400).json({ error: 'يرجى كتابة نص أو إضافة صورة' })
    if (trimmed.length > 1000) return res.status(400).json({ error: 'النص طويل جداً' })
    if (image) {
      if (typeof image !== 'string' || !image.startsWith('data:image/')) {
        return res.status(400).json({ error: 'صيغة الصورة غير صحيحة' })
      }
      if (image.length > 400_000) return res.status(400).json({ error: 'الصورة كبيرة جداً، يرجى اختيار صورة أصغر' })
    }

    const user = await getUser(req.user.username)
    if (!user) return res.status(401).json({ error: 'مستخدم غير موجود' })

    const post = await createPost({
      username: req.user.username,
      name: user.name,
      avatar: user.avatar,
      photo: user.photo,
      role: user.role,
      text: trimmed,
      image: image || null,
    })
    return res.status(201).json({ post })
  }

  if (req.method === 'DELETE') {
    const { id } = req.query
    if (!id) return res.status(400).json({ error: 'missing id' })
    const post = await findPost(id)
    if (!post) return res.status(404).json({ error: 'المنشور غير موجود' })
    if (post.username !== req.user.username && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'غير مسموح' })
    }
    await deletePost(id)
    return res.status(200).json({ success: true })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}

export default requireAuth(handler)
