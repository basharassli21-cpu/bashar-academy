// scripts/diagnose-blob.js — reads current Blob state using dotenv (handles BOM + CRLF)
import { readFileSync } from 'fs'
import { get, put } from '@vercel/blob'

// Manual .env parser — handles BOM, CRLF, and quoted values
function loadEnv(path) {
  const raw = readFileSync(path, 'utf8').replace(/^﻿/, '') // strip BOM
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/)
    if (m) process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '')
  }
}
loadEnv('.env.local')

const BLOB_KEY = 'cba-users-v3.json'
const TOKEN    = process.env.BLOB_READ_WRITE_TOKEN

if (!TOKEN) { console.error('❌ BLOB_READ_WRITE_TOKEN not found'); process.exit(1) }

console.log('🔍 Reading Vercel Blob...\n')

try {
  const result = await get(BLOB_KEY, { access: 'private', useCache: false, token: TOKEN })
  if (!result?.stream) {
    console.log('⚠️  No stream returned — blob may be empty or missing')
    process.exit(0)
  }
  const text  = await new Response(result.stream).text()
  const data  = JSON.parse(text)
  const users = Object.entries(data)

  console.log(`📦 Total users in Blob: ${users.length}\n`)

  const students = users.filter(([, u]) => u.role === 'student')
  const admins   = users.filter(([, u]) => u.role === 'admin')

  console.log(`👤 Admins   : ${admins.length}`)
  console.log(`🎓 Students : ${students.length}\n`)

  for (const [username, u] of users) {
    const flags = [
      u.softDeleted ? '🔴 SOFT-DELETED' : '🟢 active',
      u.role,
      u.allowedCourse ? `course=${u.allowedCourse}` : '',
      u.subscriptionType === 'monthly' ? `sub until ${u.subscriptionExpiry}` : '',
    ].filter(Boolean).join(' | ')
    console.log(`  ${username.padEnd(22)} ${flags}`)
  }

} catch(e) {
  console.error('❌ Error:', e.name, e.message)
}
