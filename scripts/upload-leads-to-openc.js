// Puts the numbers of a leads spreadsheet into the OpenC pool.
// Expects the sheet exported by the old CRM: columns Full Name, Phone, Type, Status.
//
// Left out: every number that has a SOLD row, cells with no usable phone number,
// repeats inside the file, numbers already on a lead or already open in the
// pool, and numbers that already bought on the platform.
//
// Dry run (default — reads only, changes nothing):
//   node scripts/upload-leads-to-openc.js <file.xlsx>
// Apply:
//   node scripts/upload-leads-to-openc.js <file.xlsx> --apply
//
// Prints counts only. On apply, the ids of the inserted pool rows are written to
// scripts/backups/openc-upload-<timestamp>.json, so a batch can be taken out again:
//   DELETE FROM openc_leads WHERE id = ANY(<opencLeadIds>) AND status = 'open'

require('dotenv').config({ path: '.env.local' })
const fs = require('fs')
const path = require('path')
const XLSX = require('xlsx')
const { neon } = require('@neondatabase/serverless')

const sql = neon(process.env.DATABASE_URL || process.env.POSTGRES_URL)
const file = process.argv[2]
const apply = process.argv.includes('--apply')

// File status -> the platform's status + the Arabic wording shown on the pool card.
// Listed from most to least telling: when a number appears on several rows, the
// first status in this order is the one kept.
const STATUS = {
  INTERESTED:     { status: 'interested',     label: 'مهتم' },
  CALL_BACK:      { status: 'contacted',      label: 'طلب معاودة الاتصال' },
  FOLLOW_UP:      { status: 'contacted',      label: 'متابعة' },
  CONTACTED:      { status: 'contacted',      label: 'تم التواصل' },
  NO_ANSWER:      { status: 'unreachable',    label: 'لا يرد' },
  NOT_INTERESTED: { status: 'not_interested', label: 'غير مهتم' },
  LOST:           { status: 'cancelled',      label: 'ألغى الفكرة' },
  OPEN:           { status: 'new',            label: null },
  FRESH:          { status: 'new',            label: null },
}
const PRIORITY = Object.keys(STATUS)
const REASON = 'مستورد من ملف خارجي'

// ─── Reading and cleaning the sheet ─────────────────────────────────────────

function readLeadRows() {
  const wb = XLSX.readFile(file)
  const table = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, defval: '', raw: false })
  const headers = table[0].map(h => String(h).trim())
  const col = (name) => { const i = headers.indexOf(name); if (i < 0) throw new Error('missing column: ' + name); return i }
  const iName = col('Full Name'), iPhone = col('Phone'), iStatus = col('Status')
  return table.slice(1)
    .filter(r => r.some(c => String(c).trim() !== ''))
    .map(r => ({ name: String(r[iName]).trim(), phone: String(r[iPhone]).trim(), status: String(r[iStatus]).trim().toUpperCase() }))
}

// The export has been through a tool that read its UTF-8 as Windows-1256, some
// cells more than once, so Arabic arrives as "ط§ظ„…". Mapping the characters
// back to bytes and decoding as UTF-8 restores it. Genuine Arabic or accented
// text is left alone: mapped back to bytes it is never valid UTF-8, so the
// reversal fails and the original is kept.
const cp1256 = new Map()
{
  const decoder = new TextDecoder('windows-1256')
  for (let b = 0; b < 256; b++) cp1256.set(decoder.decode(Uint8Array.of(b)), b)
}
const utf8 = new TextDecoder('utf-8', { fatal: true })

function reverseOnce(text) {
  const bytes = []
  for (const ch of text) {
    const b = cp1256.get(ch)
    if (b === undefined) return null
    bytes.push(b)
  }
  // A cell that was cut off mid-character leaves a partial sequence at its end
  for (let cut = 0; cut <= 3; cut++) {
    const kept = bytes.length - cut
    if (cut > 0 && kept < 4) break
    try { return utf8.decode(Uint8Array.from(bytes.slice(0, kept))) } catch { /* try a shorter prefix */ }
  }
  return null
}

function undoMojibake(text) {
  let s = String(text ?? '')
  for (let round = 0; round < 4; round++) {
    if (/^[\x00-\x7F]*$/.test(s)) break
    const fixed = reverseOnce(s)
    if (fixed === null || fixed === s) break
    s = fixed
  }
  return s
}

const latinDigits = (s) => s.replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d))

// One comparison key per real-world number, whatever spelling it is stored in
// (the platform holds 9627…, +9627…, 07… and 7… side by side): a Jordanian
// mobile becomes 07XXXXXXXX, anything else is its digits without a leading 00.
function phoneKey(raw) {
  const digits = latinDigits(String(raw ?? '')).replace(/\D/g, '').replace(/^00/, '')
  const local = '0' + digits.replace(/^962/, '').replace(/^0/, '')
  return /^0(77|78|79)\d{7}$/.test(local) ? local : digits
}
const isJordanMobile = (key) => /^0(77|78|79)\d{7}$/.test(key)

// The number in a cell as a comparison key, or null when the cell holds no
// usable number (text, a number Excel turned into 9.6E+11, too short or long).
function cleanPhone(raw) {
  const text = latinDigits(undoMojibake(raw)).trim()
  if (/\d\s*E\s*\+\s*\d+$/i.test(text)) return null
  const key = phoneKey(text)
  if (isJordanMobile(key)) return key
  return key.length >= 8 && key.length <= 15 ? key : null
}

// A readable name, or '' when the cell holds nothing that reads as one.
function cleanName(raw) {
  const name = undoMojibake(raw)
    .normalize('NFKC')
    .replace(/[\u0000-\u001F\u007F-\u009F​-‏‪-‮⁠-⁩﻿�]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  if (!/\p{L}/u.test(name)) return ''
  return [...name].slice(0, 100).join('').trim()
}

// ─── Upload ─────────────────────────────────────────────────────────────────

const count = (list, keyOf) => { const m = {}; for (const x of list) { const k = keyOf(x); m[k] = (m[k] || 0) + 1 } return m }
const spelling = (p) => /^9627[789]\d{7}$/.test(p) ? '9627XXXXXXXX' : /^07[789]\d{7}$/.test(p) ? '07XXXXXXXX' : 'other'

async function run() {
  if (!file) throw new Error('usage: node scripts/upload-leads-to-openc.js <file.xlsx> [--apply]')
  const rows = readLeadRows()
  const unknown = rows.filter(r => r.status !== 'SOLD' && !STATUS[r.status])
  if (unknown.length) throw new Error('unexpected status values: ' + JSON.stringify(count(unknown, r => r.status)))

  for (const r of rows) r.key = cleanPhone(r.phone)
  const soldKeys = new Set(rows.filter(r => r.status === 'SOLD' && r.key).map(r => r.key))
  const soldRows = rows.filter(r => r.status === 'SOLD' || soldKeys.has(r.key))
  const noPhone = rows.filter(r => !r.key && r.status !== 'SOLD')

  const byKey = new Map()
  for (const r of rows) {
    if (!r.key || r.status === 'SOLD' || soldKeys.has(r.key)) continue
    if (!byKey.has(r.key)) byKey.set(r.key, [])
    byKey.get(r.key).push(r)
  }
  const candidates = [...byKey.entries()].map(([key, group]) => {
    const best = [...group].sort((a, b) => PRIORITY.indexOf(a.status) - PRIORITY.indexOf(b.status))[0]
    const name = cleanName(best.name) || group.map(r => cleanName(r.name)).find(Boolean) || ''
    return { key, name, fileStatus: best.status }
  })
  const repeats = [...byKey.values()].reduce((n, g) => n + g.length - 1, 0)

  const [leadRows, poolRows, saleRows] = await Promise.all([
    sql`SELECT phone FROM leads`,
    sql`SELECT phone, status FROM openc_leads`,
    sql`SELECT student_phone_normalized AS phone FROM sale_records WHERE sale_status <> 'cancelled' AND approval_status <> 'rejected'`,
  ])
  const onLead = new Set(leadRows.map(r => phoneKey(r.phone)))
  const inOpenPool = new Set(poolRows.filter(r => r.status === 'open').map(r => phoneKey(r.phone)))
  const bought = new Set(saleRows.map(r => phoneKey(r.phone)))

  const skippedBought = candidates.filter(c => bought.has(c.key))
  const skippedLead = candidates.filter(c => !bought.has(c.key) && onLead.has(c.key))
  const skippedPool = candidates.filter(c => !bought.has(c.key) && !onLead.has(c.key) && inOpenPool.has(c.key))
  const toInsert = candidates.filter(c => !bought.has(c.key) && !onLead.has(c.key) && !inOpenPool.has(c.key))

  // Jordanian mobiles are written the way most of the platform's numbers already are
  const existing = count([...leadRows, ...poolRows], r => spelling(String(r.phone)))
  const intlStyle = (existing['9627XXXXXXXX'] || 0) >= (existing['07XXXXXXXX'] || 0)
  const stored = (key) => isJordanMobile(key) && intlStyle ? '962' + key.slice(1) : key

  const records = toInsert.map(c => ({
    name: c.name || stored(c.key),
    phone: stored(c.key),
    status: STATUS[c.fileStatus].status,
    reason: STATUS[c.fileStatus].label ? `${REASON} — آخر حالة: ${STATUS[c.fileStatus].label}` : REASON,
  }))

  console.log('File rows:                                   ', rows.length)
  console.log('  left out — SOLD (all rows of a sold number):', soldRows.length, `(${soldKeys.size} numbers)`)
  console.log('  left out — no usable phone number:         ', noPhone.length)
  console.log('  left out — repeats of a number in the file:', repeats)
  console.log('Distinct numbers left:                       ', candidates.length)
  console.log('  left out — already bought on the platform: ', skippedBought.length)
  console.log('  left out — already on a lead (an employee):', skippedLead.length)
  console.log('  left out — already open in the pool:       ', skippedPool.length)
  console.log('TO ADD TO THE POOL:                          ', records.length)
  console.log('  by pool status:', JSON.stringify(count(records, r => r.status)))
  console.log('  Jordanian mobiles:', toInsert.filter(c => isJordanMobile(c.key)).length, '| other numbers:', toInsert.filter(c => !isJordanMobile(c.key)).length)
  console.log('  name taken from the phone (no readable name):', toInsert.filter(c => !c.name).length)
  console.log('Platform now: leads', leadRows.length, '| pool open', poolRows.filter(r => r.status === 'open').length, '| pool total', poolRows.length)

  if (!apply) { console.log('\nDry run — nothing changed. Re-run with --apply to add them.'); return }
  if (records.length === 0) { console.log('\nNothing to add.'); return }

  const CHUNK = 500
  const statements = []
  for (let i = 0; i < records.length; i += CHUNK) {
    const part = records.slice(i, i + CHUNK)
    statements.push(sql`
      INSERT INTO openc_leads (customer_name, phone, last_status, reason, status)
      SELECT t.name, t.phone, t.status, t.reason, 'open'
      FROM unnest(${part.map(r => r.name)}::text[], ${part.map(r => r.phone)}::text[], ${part.map(r => r.status)}::text[], ${part.map(r => r.reason)}::text[])
        AS t(name, phone, status, reason)
      RETURNING id
    `)
  }
  const ids = (await sql.transaction(statements)).flat().map(r => r.id)

  const addedAt = new Date().toISOString()
  const backupDir = path.join(__dirname, 'backups')
  const backupFile = path.join(backupDir, `openc-upload-${addedAt.replace(/[:.]/g, '-')}.json`)
  fs.mkdirSync(backupDir, { recursive: true })
  fs.writeFileSync(backupFile, JSON.stringify({ addedAt, source: path.basename(file), opencLeadIds: ids }) + '\n')

  const [after] = await sql`SELECT COUNT(*) FILTER (WHERE status = 'open')::int AS open, COUNT(*)::int AS total FROM openc_leads`
  console.log(`\nAdded ${ids.length} numbers to the pool. Pool now: open ${after.open} | total ${after.total}`)
  console.log('Inserted row ids saved to', path.relative(process.cwd(), backupFile))
}

run().catch(err => { console.error(err); process.exit(1) })
