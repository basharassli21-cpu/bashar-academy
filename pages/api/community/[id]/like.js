import { requireAuth } from '../../../../lib/auth'
import { toggleLike } from '../../../../lib/community-store'

async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { id } = req.query
  const post = await toggleLike(id, req.user.username)
  if (!post) return res.status(404).json({ error: 'المنشور غير موجود' })
  return res.status(200).json({ likes: post.likes })
}

export default requireAuth(handler)
