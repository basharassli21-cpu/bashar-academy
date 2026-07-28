// Quick smoke test for the new Postgres-based users-store
import { readFileSync } from 'fs'
import { neon } from '@neondatabase/serverless'

function loadEnv(path) {
  const raw = readFileSync(path, 'utf8').replace(/^﻿/, '')
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/)
    if (m) process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '')
  }
}
loadEnv('.env.local')

const sql = neon(process.env.DATABASE_URL || process.env.POSTGRES_URL)

let pass = 0, fail = 0
const ok  = (l) => { console.log(`  ✓ ${l}`); pass++ }
const err = (l) => { console.error(`  ✗ ${l}`); fail++ }

console.log('\n🔍 Testing app_users table...\n')

// 1. Table exists
const [{ tbl }] = await sql`
  SELECT COUNT(*)::int AS tbl FROM information_schema.tables
  WHERE table_name = 'app_users'`
tbl > 0 ? ok('app_users table exists') : err('app_users table MISSING')

// 2. Users exist
const rows = await sql`SELECT username, role, name FROM app_users ORDER BY username`
rows.length > 0 ? ok(`${rows.length} users in DB`) : err('No users found')

// 3. Required accounts present
const usernames = rows.map(r => r.username)
usernames.includes('bashar') ? ok('Admin bashar exists') : err('Admin bashar MISSING')

// 4. Students exist
const students = rows.filter(r => r.role === 'student')
students.length > 0
  ? ok(`${students.length} student(s) found`)
  : err('No students found')

// 5. All users details
console.log('\n📋 Current users:')
for (const r of rows) {
  const [full] = await sql`SELECT allowed_course, subscription_type, soft_deleted FROM app_users WHERE username = ${r.username}`
  const flags = [r.role, full.allowed_course || '', full.soft_deleted ? '🔴 SOFT-DELETED' : '🟢'].filter(Boolean).join(' | ')
  console.log(`   ${r.username.padEnd(22)} ${r.name.padEnd(25)} ${flags}`)
}

// 6. Index exists
const [{ idx }] = await sql`
  SELECT COUNT(*)::int AS idx FROM pg_indexes
  WHERE tablename = 'app_users' AND indexname = 'idx_app_users_role'`
idx > 0 ? ok('Role index exists') : err('Role index MISSING')

console.log(`\n${fail === 0 ? '✅' : '❌'} ${pass} passed, ${fail} failed\n`)
