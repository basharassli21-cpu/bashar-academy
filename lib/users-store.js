// lib/users-store.js — Persistent user storage via Vercel Blob (private store)

import { put, get } from '@vercel/blob'

const BLOB_KEY = 'cba-users-v3.json'

const SEED_USERS = {
  "student1": {
    name: "أحمد الخالد", avatar: "أخ", role: "student",
    passwordHash: "$2a$10$dog035qIUMHO6IltcppIUOAW.EbpFLZ3rm.9aXgV/NQInfb8FXXU.",
    progress: {}, quizScores: {}, allowedCourse: "comprehensive", joinedAt: "2024-01-15"
  },
  "sarah": {
    name: "سارة المنصور", avatar: "سم", role: "student",
    passwordHash: "$2a$10$qx1i7.RvXrYNAdSQT8Z0MOT7qCUn9B2ZscPCTUw/ZBcnHWLRtwOXm",
    progress: {}, quizScores: {}, allowedCourse: "intermediate", joinedAt: "2024-01-20"
  },
  "bashar": {
    name: "بشار العسلي", avatar: "بع", role: "admin",
    passwordHash: "$2a$10$U67Nd/q42cpThMd/9pRtwuTr9UO5DpQ03euRCWyFbil7tanKX2DA6",
    progress: {}, quizScores: {}, joinedAt: "2024-01-01"
  }
}

let _cache = null
let _cacheAt = 0
const TTL = 15_000

async function readUsers() {
  if (_cache && Date.now() - _cacheAt < TTL) return _cache

  try {
    const result = await get(BLOB_KEY, { access: 'private', useCache: false })
    if (!result || !result.stream) {
      console.log('[store] no stream returned, seeding')
      return await writeUsers(SEED_USERS)
    }
    const text = await new Response(result.stream).text()
    const data = JSON.parse(text)
    const isValid = data && typeof data === 'object' && Object.values(data).some(u => u && u.role)
    if (!isValid) {
      console.log('[store] invalid blob data, re-seeding')
      return await writeUsers(SEED_USERS)
    }
    _cache = data
    _cacheAt = Date.now()
    console.log('[store] read ok, users:', Object.keys(data).join(', '))
    return _cache
  } catch (err) {
    if (err?.name === 'BlobNotFoundError' || err?.message?.includes('not found') || err?.statusCode === 404) {
      console.log('[store] blob not found, seeding fresh')
      return await writeUsers(SEED_USERS)
    }
    console.error('[store] readUsers error:', err.name, err.message)
    return SEED_USERS
  }
}

async function writeUsers(users) {
  try {
    await put(BLOB_KEY, JSON.stringify(users), {
      access: 'private',
      contentType: 'application/json',
      addRandomSuffix: false,
      allowOverwrite: true,
    })
    _cache = users
    _cacheAt = Date.now()
    console.log('[store] write ok, users:', Object.keys(users).join(', '))
    return users
  } catch (err) {
    console.error('[store] writeUsers error:', err.name, err.message)
    return users
  }
}

export async function getUser(username) {
  const users = await readUsers()
  return users[username.toLowerCase()] || null
}

export async function getAllUsers() {
  return await readUsers()
}

export async function createUser(username, userData) {
  _cache = null
  const users = await readUsers()
  users[username.toLowerCase()] = userData
  const saved = await writeUsers(users)
  _cache = null  // force next read from blob
  return saved[username.toLowerCase()] || userData
}

export async function updateUser(username, updates) {
  const users = await readUsers()
  const key = username.toLowerCase()
  if (!users[key]) return
  users[key] = { ...users[key], ...updates }
  await writeUsers(users)
}

export async function deleteUser(username) {
  _cache = null
  const users = await readUsers()
  delete users[username.toLowerCase()]
  await writeUsers(users)
  _cache = null
}
