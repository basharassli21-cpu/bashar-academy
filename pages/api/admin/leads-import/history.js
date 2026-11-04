import { requireAuth } from '../../../../lib/auth'
import { getImportHistory } from '../../../../lib/import-db'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL || process.env.POSTGRES_URL)

async function handler(req, res) {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'صلاحيات غير كافية' })

  if (req.method === 'GET') {
    const history = await getImportHistory()
    return res.status(200).json({ history })
  }

  if (req.method === 'DELETE') {
    const { id } = req.query
    if (!id) return res.status(400).json({ error: 'id مطلوب' })
    await sql`DELETE FROM lead_imports WHERE id = ${parseInt(id)}`
    return res.status(200).json({ ok: true })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}

export default requireAuth(handler)
