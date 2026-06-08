// lib/users-store.js — Persistent user storage via Vercel Blob (public)

import { put, list } from '@vercel/blob'

const BLOB_KEY = 'cba-users-v2.json'

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
let _blobUrl = null
const TTL = 20_000

async function readUsers() {
  if (_cache && Date.now() - _cacheAt < TTL) return _cache
  try {
    // If we already know the blob URL, fetch directly
    if (_blobUrl) {
      const r = await fetch(_blobUrl + '?t=' + Date.now())
      if (r.ok) {
        _cache = await r.json()
        _cacheAt = Date.now()
        return _cache
      }
    }

    // Find blob by listing
    const { blobs } = await list({ prefix: BLOB_KEY })
    if (!blobs.length) return await writeUsers(SEED_USERS)

    const newest = [...blobs].sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))[0]
    _blobUrl = newest.url

    const r = await fetch(_blobUrl + '?t=' + Date.now())
    if (!r.ok) {
      console.error('[store] fetch failed', r.status)
      return await writeUsers(SEED_USERS)
    }

    _cache = await r.json()
    _cacheAt = Date.now()
    return _cache
  } catch (err) {
    console.error('[store] readUsers error:', err.message)
    return SEED_USERS
  }
}

async function writeUsers(users) {
  try {
    const blob = await put(BLOB_KEY, JSON.stringify(users), {
      access: 'public',
      contentType: 'application/json',
      addRandomSuffix: false,
    })
    _blobUrl = blob.url
    _cache = users
    _cacheAt = Date.now()
    console.log('[store] written ok, url:', blob.url)
  } catch (err) {
    console.error('[store] writeUsers error:', err.message)
  }
  return users
}

// Force clear cache (call after any write)
function bust() { _cache = null; _cacheAt = 0 }

export async function getUser(username) {
  const users = await readUsers()
  return users[username.toLowerCase()] || null
}

export async function getAllUsers() {
  return await readUsers()
}

export async function createUser(username, userData) {
  bust()
  const users = await readUsers()
  users[username.toLowerCase()] = userData
  await writeUsers(users)
  bust()
}

export async function updateUser(username, updates) {
  const users = await readUsers()
  const key = username.toLowerCase()
  if (!users[key]) return
  users[key] = { ...users[key], ...updates }
  await writeUsers(users)
}

export async function deleteUser(username) {
  bust()
  const users = await readUsers()
  delete users[username.toLowerCase()]
  await writeUsers(users)
  bust()
}
