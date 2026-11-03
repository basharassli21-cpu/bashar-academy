import { requireAuth } from '../../../lib/auth'
import { hashPassword, verifyPassword } from '../../../lib/db'
import { getUser, updateUser } from '../../../lib/users-store'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL || process.env.POSTGRES_URL)

async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { newPassword } = req.body || {}
  if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 8) {
    return res.status(400).json({ error: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' })
  }

  const user = await getUser(req.user.username)
  if (!user) return res.status(404).json({ error: 'المستخدم غير موجود' })

  const passwordHash = await hashPassword(newPassword)

  await updateUser(req.user.username, {
    passwordHash,
    passwordChangedAt: new Date().toISOString(),
  })

  // Clear the requires_password_change flag
  await sql`UPDATE app_users SET requires_password_change = FALSE WHERE username = ${req.user.username}`

  return res.status(200).json({ success: true })
}

export default requireAuth(handler)
