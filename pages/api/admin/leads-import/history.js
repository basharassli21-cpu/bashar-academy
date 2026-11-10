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
    const iid = parseInt(id)

    // Fetch the import record to know its timestamp (for legacy fallback)
    const [row] = await sql`SELECT * FROM lead_imports WHERE id = ${iid}`
    if (!row) return res.status(404).json({ error: 'السجل غير موجود' })

    // A hand-entered "Open" lead owns a pool row that exists only for it
    await sql`
      DELETE FROM openc_leads
      WHERE id IN (SELECT claimed_from_openc_id FROM leads WHERE import_id = ${iid} AND claimed_from_openc_id IS NOT NULL)
    `

    // Delete leads linked by import_id (new imports)
    const linked = await sql`DELETE FROM leads WHERE import_id = ${iid} RETURNING id`

    // Fallback for legacy imports (no import_id): delete leads created in the same minute
    if (linked.length === 0 && row.imported_count > 0) {
      await sql`
        DELETE FROM leads
        WHERE import_id IS NULL
          AND created_at >= ${row.created_at}::timestamptz - interval '5 seconds'
          AND created_at <= ${row.created_at}::timestamptz + interval '5 minutes'
      `
    }

    await sql`DELETE FROM lead_imports WHERE id = ${iid}`
    return res.status(200).json({ ok: true, deletedLeads: linked.length })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}

export default requireAuth(handler)
