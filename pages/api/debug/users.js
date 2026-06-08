import { put, list } from '@vercel/blob'

export default async function handler(req, res) {
  if (req.query.secret !== 'bashar2024debug') return res.status(403).end()

  const out = { blobToken: !!process.env.BLOB_READ_WRITE_TOKEN, step: '', error: null, users: null, blobUrl: null }

  try {
    // Step 1: Write test
    out.step = 'write'
    const testData = { _test: true, ts: Date.now() }
    const blob = await put('cba-test.json', JSON.stringify(testData), { access: 'public', contentType: 'application/json', addRandomSuffix: false })
    out.blobUrl = blob.url
    out.writeOk = true

    // Step 2: Read test
    out.step = 'read'
    const r = await fetch(blob.url)
    out.readStatus = r.status
    out.readOk = r.ok

    // Step 3: List users blob
    out.step = 'list'
    const { blobs } = await list({ prefix: 'cba-users-v2.json' })
    out.usersBlobs = blobs.map(b => ({ pathname: b.pathname, uploadedAt: b.uploadedAt, size: b.size, url: b.url }))

    if (blobs.length) {
      const r2 = await fetch(blobs[0].url)
      if (r2.ok) {
        const data = await r2.json()
        out.users = Object.keys(data).map(u => ({ username: u, role: data[u].role, course: data[u].allowedCourse }))
      }
    }

    out.step = 'done'
  } catch (err) {
    out.error = err.message
  }

  return res.status(200).json(out)
}
