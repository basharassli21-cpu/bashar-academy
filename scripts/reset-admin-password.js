// scripts/reset-admin-password.js
// Resets the admin password in Vercel Blob.
//
// Usage:
//   NEW_ADMIN_PASS=<your-new-password> node --env-file=.env.local scripts/reset-admin-password.js
//
// [M6] The plain-text password is now read from an env var — never hardcoded in source.

import bcrypt from 'bcryptjs'
import { put, get } from '@vercel/blob'

const BLOB_KEY = 'cba-users-v3.json'
const USERNAME = 'bashar'
const NEW_PASS = process.env.NEW_ADMIN_PASS
const TOKEN    = process.env.BLOB_READ_WRITE_TOKEN

async function run() {
  if (!TOKEN)    { console.error('❌ BLOB_READ_WRITE_TOKEN not set'); process.exit(1) }
  if (!NEW_PASS) {
    console.error('❌ NEW_ADMIN_PASS env var is required')
    console.error('   Usage: NEW_ADMIN_PASS=yourpassword node --env-file=.env.local scripts/reset-admin-password.js')
    process.exit(1)
  }
  if (NEW_PASS.length < 8) {
    console.error('❌ Password must be at least 8 characters')
    process.exit(1)
  }

  console.log('🔑 Resetting admin password...')

  const result = await get(BLOB_KEY, { access: 'private', useCache: false, token: TOKEN })
  if (!result?.stream) { console.error('❌ Could not load users blob'); process.exit(1) }
  const text  = await new Response(result.stream).text()
  const users = JSON.parse(text)

  if (!users[USERNAME]) { console.error(`❌ User "${USERNAME}" not found`); process.exit(1) }

  const hash = await bcrypt.hash(NEW_PASS, 10)
  users[USERNAME].passwordHash      = hash
  users[USERNAME].passwordChangedAt = new Date().toISOString()

  await put(BLOB_KEY, JSON.stringify(users), { access: 'private', allowOverwrite: true, token: TOKEN })

  console.log(`✅ Password updated for "${USERNAME}"`)
}

run().catch(e => { console.error('❌', e.message); process.exit(1) })
