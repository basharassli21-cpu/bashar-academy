import { requireAuth } from '../../../../../lib/auth'
import { toggleCommentReaction } from '../../../../../lib/community-store'

const ALLOWED_EMOJI = ['❤️', '🎉', '👍', '🔥']

async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { id } = req.query
  const { commentId, emoji } = req.body || {}
  if (!commentId) return res.status(400).json({ error: 'missing commentId' })
  if (!ALLOWED_EMOJI.includes(emoji)) return res.status(400).json({ error: 'رمز تعبيري غير مسموح' })
  const comment = await toggleCommentReaction(id, commentId, req.user.username, emoji)
  if (!comment) return res.status(404).json({ error: 'التعليق غير موجود' })
  return res.status(200).json({ reactions: comment.reactions })
}

export default requireAuth(handler)
