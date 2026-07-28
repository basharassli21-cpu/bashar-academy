import { readFileSync } from 'fs'
import { get } from '@vercel/blob'

function loadEnv(path) {
  const raw = readFileSync(path, 'utf8').replace(/^﻿/, '')
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/)
    if (m) process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '')
  }
}
loadEnv('.env.local')

const TOKEN = process.env.BLOB_READ_WRITE_TOKEN
console.log('Token length:', TOKEN?.length)
console.log('Token start :', TOKEN?.slice(0, 25) + '...')
console.log('Token end   :', '...' + TOKEN?.slice(-6))

// Try to read blob using the env var (without passing token explicitly)
try {
  const r = await get('cba-users-v3.json', { access: 'private', useCache: false })
  console.log('✅ Got blob via env var')
  if (r?.stream) {
    const text = await new Response(r.stream).text()
    const data = JSON.parse(text)
    console.log('Users:', Object.keys(data).join(', '))
  }
} catch(e) {
  console.log('❌ Via env var:', e.message)
}
