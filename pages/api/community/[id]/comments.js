import { requireAuth } from '../../../../lib/auth'
import { addComment, deleteComment, findPost } from '../../../../lib/community-store'
import { getUser } from '../../../../lib/users-store'

async function handler(req, res) {
  const { id } = req.query

  if (req.method === 'POST') {
    const text = (req.body?.text || '').trim()
    if (!text) return res.status(400).json({ error: 'يرجى كتابة تعليق' })
    if (text.length > 500) return res.status(400).json({ error: 'التعليق طويل جداً' })

    const user = await getUser(req.user.username)
    if (!user) return res.status(401).json({ error: 'مستخدم غير موجود' })

    const comment = await addComment(id, {
      username: req.user.username,
      name: user.name,
      avatar: user.avatar,
      photo: user.photo,
      text,
    })
    if (!comment) return res.status(404).json({ error: 'المنشور غير موجود' })
    return res.status(201).json({ comment })
  }

  if (req.method === 'DELETE') {
    const { commentId } = req.query
    const post = await findPost(id)
    if (!post) return res.status(404).json({ error: 'غير موجود' })
    const comment = (post.comments || []).find(c => c.id === commentId)
    if (!comment) return res.status(404).json({ error: 'غير موجود' })
    if (comment.username !== req.user.username && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'غير مسموح' })
    }
    await deleteComment(id, commentId)
    return res.status(200).json({ success: true })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}

export default requireAuth(handler)
