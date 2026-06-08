import { put, list } from '@vercel/blob'

export default async function handler(req, res) {
  if (req.query.secret !== 'bashar2024debug') return res.status(403).end()

  const out = { blobToken: !!process.env.BLOB_READ_WRITE_TOKEN, writeOk: false, readOk: false, users: null, error: null }
  const authH = { Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}` }

  try {
    // Test write
    await put('cba-users-v3.json', JSON.stringify({ _ping: Date.now() }), {
      access: 'private', contentType: 'application/json', addRandomSuffix: false
    })
    out.writeOk = true

    // Test list + read
    const { blobs } = await list({ prefix: 'cba-users-v3.json' })
    out.blobCount = blobs.length
    if (blobs.length) {
      const newest = [...blobs].sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))[0]
      const r = await fetch(newest.downloadUrl, { headers: authH })
      out.readStatus = r.status
      out.readOk = r.ok
      if (r.ok) out.content = await r.json()
    }
  } catch (err) {
    out.error = err.message
  }

  return res.status(200).json(out)
}
