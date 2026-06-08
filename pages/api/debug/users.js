import { list } from '@vercel/blob'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()
  // Admin-only via secret param
  if (req.query.secret !== 'bashar2024debug') return res.status(403).end()

  const results = { blobToken: !!process.env.BLOB_READ_WRITE_TOKEN, blobs: [], users: null, error: null }

  try {
    const { blobs } = await list({ prefix: 'users-db.json' })
    results.blobs = blobs.map(b => ({ pathname: b.pathname, uploadedAt: b.uploadedAt, size: b.size, downloadUrl: b.downloadUrl?.substring(0, 60) + '...' }))

    if (blobs.length > 0) {
      const sorted = [...blobs].sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))

      // Try without auth header
      let fetchRes = await fetch(sorted[0].downloadUrl)
      results.fetchStatus1 = fetchRes.status

      // Try with auth header
      if (!fetchRes.ok) {
        fetchRes = await fetch(sorted[0].downloadUrl, {
          headers: { Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}` }
        })
        results.fetchStatus2 = fetchRes.status
      }

      if (fetchRes.ok) {
        const data = await fetchRes.json()
        results.users = Object.keys(data).map(u => ({ username: u, role: data[u].role, allowedCourse: data[u].allowedCourse }))
      }
    }
  } catch (err) {
    results.error = err.message
  }

  return res.status(200).json(results)
}
