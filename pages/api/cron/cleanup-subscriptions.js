// Daily cron — suspends monthly subscribers whose subscriptionExpiry has passed.
// Uses soft-delete (softDeleted flag) instead of permanent deletion so admins
// can recover accounts. Hard delete must be done manually from the admin panel.
// Triggered by Vercel Cron (vercel.json) at 02:00 UTC every day.
// Protected by CRON_SECRET env var.

import { getAllUsers, updateUser } from '../../../lib/users-store'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()

  const authHeader = req.headers.authorization
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const users = await getAllUsers()
  const today = new Date()
  const suspended = []

  for (const [username, user] of Object.entries(users)) {
    if (
      user.role === 'student' &&
      user.subscriptionType === 'monthly' &&
      user.subscriptionExpiry &&
      new Date(user.subscriptionExpiry) < today &&
      !user.softDeleted
    ) {
      await updateUser(username, {
        softDeleted: true,
        softDeletedAt: new Date().toISOString(),
      })
      suspended.push(username)
    }
  }

  console.log(`[cron] suspended expired subscribers: ${suspended.join(', ') || 'none'}`)
  return res.status(200).json({ suspended, count: suspended.length })
}
