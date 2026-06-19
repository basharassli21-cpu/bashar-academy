// Daily cron — deletes monthly subscribers whose subscriptionExpiry has passed.
// Triggered by Vercel Cron (vercel.json) at 02:00 UTC every day.
// Protected by CRON_SECRET env var.

import { getAllUsers, deleteUser } from '../../../lib/users-store'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()

  const authHeader = req.headers.authorization
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const users = await getAllUsers()
  const today = new Date()
  const deleted = []

  for (const [username, user] of Object.entries(users)) {
    if (
      user.role === 'student' &&
      user.subscriptionType === 'monthly' &&
      user.subscriptionExpiry &&
      new Date(user.subscriptionExpiry) < today
    ) {
      await deleteUser(username)
      deleted.push(username)
    }
  }

  console.log(`[cron] deleted expired subscribers: ${deleted.join(', ') || 'none'}`)
  return res.status(200).json({ deleted, count: deleted.length })
}
