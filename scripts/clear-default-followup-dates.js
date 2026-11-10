// One-time data fix. Leads used to be created with an automatic follow-up date
// (the last day of their creation month). A follow-up date is now only ever set
// by a person, and a lead whose date is still ahead is hidden from its employee
// until that day — so a leftover automatic date would hide the lead until the
// end of the month. This clears those automatic dates and nothing else.
//
// Dry run (default, changes nothing):  node scripts/clear-default-followup-dates.js
// Apply:                               node scripts/clear-default-followup-dates.js --apply
//
// The ids of the cleared leads are recorded in admin_audit_log
// (action = 'clear_default_followup_dates'). To undo, set those leads back to
// the last day of their creation month:
//   UPDATE leads SET next_followup_date =
//     (date_trunc('month', created_at AT TIME ZONE 'UTC') + interval '1 month' - interval '1 day')::date
//   WHERE id = ANY(<ids from the audit row>)

require('dotenv').config({ path: '.env.local' })
const { neon } = require('@neondatabase/serverless')

const sql = neon(process.env.DATABASE_URL || process.env.POSTGRES_URL)
const apply = process.argv.includes('--apply')

async function run() {
  const rows = await sql`
    SELECT id, status FROM leads
    WHERE next_followup_date = (date_trunc('month', created_at AT TIME ZONE 'UTC') + interval '1 month' - interval '1 day')::date
    ORDER BY id
  `
  const kept = await sql`SELECT COUNT(*)::int AS n FROM leads WHERE next_followup_date IS NOT NULL`
  const byStatus = {}
  for (const r of rows) byStatus[r.status] = (byStatus[r.status] || 0) + 1

  console.log(`Leads carrying the automatic end-of-month date: ${rows.length}`)
  console.log('  by status:', JSON.stringify(byStatus))
  console.log(`Leads with a follow-up date that will be kept:  ${kept[0].n - rows.length}`)

  if (rows.length === 0) { console.log('Nothing to clear.'); return }

  const [{ audit }] = await sql`SELECT to_regclass('public.admin_audit_log') IS NOT NULL AS audit`
  if (!audit) throw new Error('admin_audit_log is missing (run scripts/migrate-improvements.js) — refusing to clear dates without a record of which leads were touched')

  if (!apply) { console.log('\nDry run — nothing changed. Re-run with --apply to clear them.'); return }

  const ids = rows.map(r => r.id)
  const [, cleared] = await sql.transaction([
    sql`
      INSERT INTO admin_audit_log (actor_username, actor_role, action, target_type, details)
      VALUES ('script', 'admin', 'clear_default_followup_dates', 'lead', ${JSON.stringify({ leadIds: ids })}::jsonb)
    `,
    sql`
      UPDATE leads SET next_followup_date = NULL
      WHERE id = ANY(${ids}::int[])
        AND next_followup_date = (date_trunc('month', created_at AT TIME ZONE 'UTC') + interval '1 month' - interval '1 day')::date
      RETURNING id
    `,
  ])
  console.log(`\nCleared ${cleared.length} automatic follow-up dates (ids recorded in admin_audit_log).`)
}

run().catch(err => { console.error(err); process.exit(1) })
