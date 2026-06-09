import { get } from '@vercel/blob'

export default async function handler(req, res) {
  if (req.query.secret !== 'bashar2024debug') return res.status(403).end()

  const out = {
    blobToken: !!process.env.BLOB_READ_WRITE_TOKEN,
    readOk: false,
    users: null,
    userCount: 0,
    error: null
  }

  try {
    const result = await get('cba-users-v3.json', { access: 'private' })
    if (result?.stream) {
      const text = await new Response(result.stream).text()
      const data = JSON.parse(text)
      out.readOk = true
      out.userCount = Object.keys(data).length
      out.users = Object.entries(data).map(([username, u]) => ({
        username,
        role: u.role,
        name: u.name,
        allowedCourse: u.allowedCourse || null,
        joinedAt: u.joinedAt
      }))
    }
  } catch (err) {
    out.error = `${err.name}: ${err.message}`
  }

  return res.status(200).json(out)
}
