// lib/community-store.js — Persistent community posts via Vercel Blob (private store)

import { put, get } from '@vercel/blob'

const BLOB_KEY = 'cba-community-v1.json'
const MAX_POSTS = 300
const TTL = 5_000

let _cache = null
let _cacheAt = 0

async function readPosts() {
  if (_cache && Date.now() - _cacheAt < TTL) return _cache

  try {
    const result = await get(BLOB_KEY, { access: 'private', useCache: false })
    if (!result || !result.stream) return await writePosts([])
    const text = await new Response(result.stream).text()
    const data = JSON.parse(text)
    const posts = Array.isArray(data?.posts) ? data.posts : []
    _cache = posts
    _cacheAt = Date.now()
    return _cache
  } catch (err) {
    if (err?.name === 'BlobNotFoundError' || err?.message?.includes('not found') || err?.statusCode === 404) {
      return await writePosts([])
    }
    console.error('[community-store] readPosts error:', err.name, err.message)
    return []
  }
}

async function writePosts(posts) {
  try {
    await put(BLOB_KEY, JSON.stringify({ posts }), {
      access: 'private',
      contentType: 'application/json',
      addRandomSuffix: false,
      allowOverwrite: true,
    })
    _cache = posts
    _cacheAt = Date.now()
    return posts
  } catch (err) {
    console.error('[community-store] writePosts error:', err.name, err.message)
    return posts
  }
}

function newId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export async function getPosts() {
  const posts = await readPosts()
  return [...posts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

export async function createPost({ username, name, avatar, photo, text, image }) {
  const posts = await readPosts()
  const post = {
    id: newId(),
    username, name, avatar, photo: photo || null,
    text: text || '', image: image || null,
    likes: [], comments: [],
    createdAt: new Date().toISOString(),
  }
  posts.push(post)
  if (posts.length > MAX_POSTS) posts.splice(0, posts.length - MAX_POSTS)
  await writePosts(posts)
  return post
}

export async function deletePost(postId) {
  const posts = await readPosts()
  const next = posts.filter(p => p.id !== postId)
  if (next.length === posts.length) return false
  await writePosts(next)
  return true
}

export async function findPost(postId) {
  const posts = await readPosts()
  return posts.find(p => p.id === postId) || null
}

export async function addComment(postId, { username, name, avatar, photo, text }) {
  const posts = await readPosts()
  const post = posts.find(p => p.id === postId)
  if (!post) return null
  const comment = { id: newId(), username, name, avatar, photo: photo || null, text, createdAt: new Date().toISOString() }
  post.comments = post.comments || []
  post.comments.push(comment)
  await writePosts(posts)
  return comment
}

export async function deleteComment(postId, commentId) {
  const posts = await readPosts()
  const post = posts.find(p => p.id === postId)
  if (!post) return false
  const before = (post.comments || []).length
  post.comments = (post.comments || []).filter(c => c.id !== commentId)
  if (post.comments.length === before) return false
  await writePosts(posts)
  return true
}

export async function toggleLike(postId, username) {
  const posts = await readPosts()
  const post = posts.find(p => p.id === postId)
  if (!post) return null
  post.likes = post.likes || []
  const idx = post.likes.indexOf(username)
  if (idx === -1) post.likes.push(username)
  else post.likes.splice(idx, 1)
  await writePosts(posts)
  return post
}
