import { readFileSync } from 'fs'

function loadEnv(path) {
  const raw = readFileSync(path, 'utf8').replace(/^﻿/, '')
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/)
    if (m) process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '')
  }
}
loadEnv('.env.local')

const TOKEN       = process.env.BLOB_READ_WRITE_TOKEN
const DIRECT_URL  = 'https://68vr2svmorkhd6bj.private.blob.vercel-storage.com/cba-users-v3.json'

const resp = await fetch(DIRECT_URL, {
  headers: { Authorization: `Bearer ${TOKEN}` }
})

console.log('Status:', resp.status, resp.statusText)

if (resp.ok) {
  const text  = await resp.text()
  const data  = JSON.parse(text)
  const users = Object.entries(data)
  console.log('\n=== BLOB USERS ===')
  console.log('Total:', users.length)
  for (const [u, info] of users) {
    const flags = [
      info.role,
      info.allowedCourse ? `course=${info.allowedCourse}` : '',
      info.softDeleted ? '🔴 SOFT-DELETED' : '🟢',
      info.subscriptionType === 'monthly' ? `monthly until ${info.subscriptionExpiry}` : '',
    ].filter(Boolean).join(' | ')
    console.log(`  ${u.padEnd(22)} ${flags}`)
  }
} else {
  const err = await resp.text()
  console.error('Error body:', err.slice(0, 500))
}
