// lib/users-store.js — Persistent user storage via Vercel Blob

import { put, list } from '@vercel/blob'

const BLOB_KEY = 'users-db.json'

const SEED_USERS = {
  "student1": {
    name: "أحمد الخالد",
    avatar: "أخ",
    role: "student",
    passwordHash: "$2a$10$dog035qIUMHO6IltcppIUOAW.EbpFLZ3rm.9aXgV/NQInfb8FXXU.",
    progress: {},
    quizScores: {},
    allowedCourse: "comprehensive",
    joinedAt: "2024-01-15"
  },
  "sarah": {
    name: "سارة المنصور",
    avatar: "سم",
    role: "student",
    passwordHash: "$2a$10$qx1i7.RvXrYNAdSQT8Z0MOT7qCUn9B2ZscPCTUw/ZBcnHWLRtwOXm",
    progress: {},
    quizScores: {},
    allowedCourse: "intermediate",
    joinedAt: "2024-01-20"
  },
  "bashar": {
    name: "بشار العسلي",
    avatar: "بع",
    role: "admin",
    passwordHash: "$2a$10$U67Nd/q42cpThMd/9pRtwuTr9UO5DpQ03euRCWyFbil7tanKX2DA6",
    progress: {},
    quizScores: {},
    joinedAt: "2024-01-01"
  }
}

// Per-instance cache (valid 15s to reduce blob reads)
let _cache = null
let _cacheAt = 0
const TTL = 15_000

async function readUsers() {
  if (_cache && Date.now() - _cacheAt < TTL) return _cache
  try {
    const { blobs } = await list({ prefix: BLOB_KEY })
    if (!blobs.length) return await writeUsers(SEED_USERS)

    const res = await fetch(blobs[0].downloadUrl)
    if (!res.ok) return await writeUsers(SEED_USERS)

    _cache = await res.json()
    _cacheAt = Date.now()
    return _cache
  } catch {
    return SEED_USERS
  }
}

async function writeUsers(users) {
  try {
    await put(BLOB_KEY, JSON.stringify(users), {
      access: 'private',
      contentType: 'application/json',
      addRandomSuffix: false,
    })
    _cache = users
    _cacheAt = Date.now()
  } catch (err) {
    console.error('[users-store] write error', err.message)
  }
  return users
}

export async function getUser(username) {
  const users = await readUsers()
  return users[username.toLowerCase()] || null
}

export async function getAllUsers() {
  return await readUsers()
}

export async function createUser(username, userData) {
  const users = await readUsers()
  users[username.toLowerCase()] = userData
  await writeUsers(users)
}

export async function updateUser(username, updates) {
  const users = await readUsers()
  const key = username.toLowerCase()
  if (!users[key]) return
  users[key] = { ...users[key], ...updates }
  await writeUsers(users)
}

export async function deleteUser(username) {
  const users = await readUsers()
  delete users[username.toLowerCase()]
  await writeUsers(users)
}

export function invalidateCache() {
  _cache = null
}
