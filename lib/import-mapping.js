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

const ARABIC_DIGITS = '٠١٢٣٤٥٦٧٨٩'

function latinDigits(value) {
  return String(value ?? '').replace(/[٠-٩]/g, d => ARABIC_DIGITS.indexOf(d))
}

// Cleans a hand-typed phone: separators are dropped and a Jordanian mobile in
// any spelling (+962 / 00962 / 962 / 7X…) becomes local 07XXXXXXXX. Returns
// null when the text can't be a phone number.
export function normalizePhoneInput(raw) {
  const text = latinDigits(raw).trim()
  const digits = text.replace(/\D/g, '')
  if (digits.length < 7 || digits.length > 15) return null
  const local = '0' + digits.replace(/^(00962|962)/, '').replace(/^0/, '')
  if (/^0(77|78|79)\d{7}$/.test(local)) return local
  return (text.startsWith('+') ? '+' : '') + digits
}

// Every spelling the same number may already be stored under.
export function phoneVariants(phone) {
  const digits = phone.replace(/\D/g, '')
  if (/^0(77|78|79)\d{7}$/.test(phone)) {
    const rest = digits.slice(1)
    return [phone, rest, `962${rest}`, `+962${rest}`, `00962${rest}`]
  }
  return [...new Set([phone, digits, `+${digits}`, `00${digits}`])]
}

// One hand-typed line → { name, phone }: the phone is the run of digits on the
// line, whatever else is written there is the name.
export function parseManualLine(line) {
  const text = latinDigits(line)
  const match = text.match(/\+?\d[\d\s\-()]{5,}\d/)
  const phone = match && normalizePhoneInput(match[0])
  if (!phone) return null
  const name = text.replace(match[0], ' ')
    .replace(/[,،;|\t:]+/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/^[\s\-–.]+|[\s\-–.]+$/g, '')
  return { name, phone }
}
