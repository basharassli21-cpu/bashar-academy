import { readFileSync } from 'fs'
import { list, head } from '@vercel/blob'

function loadEnv(path) {
  const raw = readFileSync(path, 'utf8').replace(/^﻿/, '')
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/)
    if (m) process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '')
  }
}
loadEnv('.env.local')

const TOKEN = process.env.BLOB_READ_WRITE_TOKEN
console.log('Token set:', !!TOKEN)

try {
  // list all blobs in the store
  const { blobs } = await list({ token: TOKEN })
  console.log('\n📦 All blobs in store:')
  if (blobs.length === 0) {
    console.log('  (empty — no blobs found)')
  } else {
    for (const b of blobs) {
      console.log(`  ${b.pathname} | size=${b.size} | ${b.uploadedAt}`)
    }
  }
} catch(e) {
  console.error('list() error:', e.message)
}

// also try head() on the known key
try {
  const info = await head('cba-users-v3.json', { token: TOKEN })
  console.log('\nhead() result:', JSON.stringify(info, null, 2))
} catch(e) {
  console.error('head() error:', e.message)
}
