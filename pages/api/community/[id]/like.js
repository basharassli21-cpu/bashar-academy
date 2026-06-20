import { requireAuth } from '../../../../lib/auth'
import { toggleReaction } from '../../../../lib/community-store'

const ALLOWED_EMOJI = ['❤️', '🎉', '👍', '🔥']

async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { id } = req.query
  const { emoji } = req.body || {}
  if (!ALLOWED_EMOJI.includes(emoji)) return res.status(400).json({ error: 'رمز تعبيري غير مسموح' })
  const post = await toggleReaction(id, req.user.username, emoji)
  if (!post) return res.status(404).json({ error: 'المنشور غير موجود' })
  return res.status(200).json({ reactions: post.reactions })
}

export default requireAuth(handler)
