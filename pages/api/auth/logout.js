// pages/api/auth/logout.js
import { clearSessionCookie } from '../../../lib/auth'

export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  clearSessionCookie(res)
  res.status(200).json({ success: true })
}
