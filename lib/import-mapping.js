// lib/import-mapping.js — pure column/status matching logic for Import Leads.
// No DB import here on purpose: this file is bundled into the browser (used
// by the upload preview) AND imported server-side (for re-validation), so it
// must never pull in @neondatabase/serverless or anything else server-only.

export const STATUSES = ['new', 'contacted', 'interested', 'not_interested', 'closed_sale', 'cancelled']

export const IMPORT_FIELDS = ['name', 'phone', 'status', 'note', 'lastContactDate', 'nextFollowupDate']

const COLUMN_ALIASES = {
  name: ['name', 'full name', 'customer name'],
  phone: ['phone', 'phone number', 'mobile', 'whatsapp', 'whatsapp number'],
  status: ['status', 'lead status', 'customer status'],
  note: ['note', 'notes', 'comment', 'remarks'],
  lastContactDate: ['last call', 'last contact', 'last contact date', 'last call date'],
  nextFollowupDate: ['next follow up', 'follow up date', 'next contact date', 'next follow-up date', 'next followup date'],
}

const STATUS_ALIASES = {
  new: ['new', 'new lead', 'lead'],
  contacted: ['contacted', 'contact made'],
  interested: ['interested', 'qualified'],
  not_interested: ['not interested', 'unqualified', 'no interest'],
  closed_sale: ['closed sale', 'closed', 'won', 'sale', 'customer', 'converted'],
  cancelled: ['cancelled', 'canceled', 'lost', 'rejected'],
}

function normalizeText(value) {
  return String(value ?? '').toLowerCase().trim().replace(/[^a-z0-9]+/g, ' ').trim()
}

// Best-guess header → canonical field mapping. Greedy, first-match-wins per
// field (in IMPORT_FIELDS order), and a header claimed by one field is never
// reused for another.
export function detectColumnMapping(headers) {
  const normalizedHeaders = headers.map(normalizeText)
  const claimed = new Set()
  const mapping = {}

  for (const field of IMPORT_FIELDS) {
    const aliases = COLUMN_ALIASES[field]
    let foundIndex = -1
    for (let i = 0; i < headers.length; i++) {
      if (claimed.has(i)) continue
      if (aliases.includes(normalizedHeaders[i])) { foundIndex = i; break }
    }
    if (foundIndex !== -1) {
      mapping[field] = headers[foundIndex]
      claimed.add(foundIndex)
    } else {
      mapping[field] = null
    }
  }
  return mapping
}

export function normalizeStatusValue(raw) {
  const normalized = normalizeText(raw)
  if (!normalized) return 'new'
  for (const status of STATUSES) {
    if (STATUS_ALIASES[status].includes(normalized)) return status
  }
  return 'new'
}

// Mirrors the timezone-safe construction in lib/sales-db.js's
// lastDayOfCurrentMonth — never cross the local/UTC boundary when building
// or reading this string back.
export function lastDayOfCurrentMonth() {
  const now = new Date()
  const y = now.getFullYear(), m = now.getMonth()
  const lastDay = new Date(y, m + 1, 0).getDate()
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`
}
