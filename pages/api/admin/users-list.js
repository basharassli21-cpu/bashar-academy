// [L4] Renamed from /api/debug/users → /api/admin/users-list
//      Same functionality, proper admin-scoped path.
import { requireAuth } from '../../../lib/auth'
import { getAllUsers } from '../../../lib/users-store'

async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()
  const users = await getAllUsers()
  return res.status(200).json({
    userCount: Object.keys(users).length,
    users:     Object.entries(users).map(([username, u]) => ({
      username,
      role:          u.role,
      name:          u.name,
      allowedCourse: u.allowedCourse || null,
      joinedAt:      u.joinedAt,
    })),
  })
}

export default requireAuth(handler, 'admin')
