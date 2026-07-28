// lib/users-store.js — User storage via Neon Postgres (migrated from Vercel Blob)
// All reads/writes go to the app_users table. No Blob dependency for user data.

import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL || process.env.POSTGRES_URL)

// Convert a Postgres row → the user object shape the rest of the app expects
function rowToUser(row) {
  if (!row) return null
  return {
    name:               row.name,
    avatar:             row.avatar,
    role:               row.role,
    passwordHash:       row.password_hash,
    photo:              row.photo,
    phone:              row.phone,
    gender:             row.gender,
    allowedCourse:      row.allowed_course,
    subscriptionType:   row.subscription_type || 'permanent',
    subscriptionExpiry: row.subscription_expiry
      ? (typeof row.subscription_expiry === 'string'
          ? row.subscription_expiry.split('T')[0]
          : row.subscription_expiry.toISOString().split('T')[0])
      : null,
    progress:           row.progress   || {},
    quizScores:         row.quiz_scores || {},
    notes:              row.notes       || {},
    softDeleted:        row.soft_deleted || false,
    softDeletedAt:      row.soft_deleted_at,
    passwordChangedAt:  row.password_changed_at,
    joinedAt:           row.joined_at
      ? (typeof row.joined_at === 'string'
          ? row.joined_at.split('T')[0]
          : row.joined_at.toISOString().split('T')[0])
      : null,
    lastLoginAt:        row.last_login_at,
    lastActiveAt:       row.last_active_at,
  }
}

export async function getUser(username) {
  const rows = await sql`
    SELECT * FROM app_users WHERE username = ${username.toLowerCase()} LIMIT 1
  `
  return rows[0] ? rowToUser(rows[0]) : null
}

export async function getAllUsers() {
  const rows = await sql`SELECT * FROM app_users ORDER BY created_at ASC`
  const obj  = {}
  for (const row of rows) obj[row.username] = rowToUser(row)
  return obj
}

export async function createUser(username, u) {
  const key = username.toLowerCase()
  await sql`
    INSERT INTO app_users (
      username, name, avatar, role, password_hash, photo, phone, gender,
      allowed_course, subscription_type, subscription_expiry,
      progress, quiz_scores, notes,
      soft_deleted, soft_deleted_at, password_changed_at,
      joined_at, last_login_at, last_active_at
    ) VALUES (
      ${key},
      ${u.name || key},
      ${u.avatar || null},
      ${u.role || 'student'},
      ${u.passwordHash || ''},
      ${u.photo || null},
      ${u.phone || null},
      ${u.gender || null},
      ${u.allowedCourse || null},
      ${u.subscriptionType || 'permanent'},
      ${u.subscriptionExpiry || null},
      ${JSON.stringify(u.progress    || {})},
      ${JSON.stringify(u.quizScores  || {})},
      ${JSON.stringify(u.notes       || {})},
      ${u.softDeleted        || false},
      ${u.softDeletedAt      || null},
      ${u.passwordChangedAt  || null},
      ${u.joinedAt           || null},
      ${u.lastLoginAt        || null},
      ${u.lastActiveAt       || null}
    )
    ON CONFLICT (username) DO UPDATE SET
      name                = EXCLUDED.name,
      avatar              = EXCLUDED.avatar,
      role                = EXCLUDED.role,
      password_hash       = EXCLUDED.password_hash,
      photo               = EXCLUDED.photo,
      allowed_course      = EXCLUDED.allowed_course,
      subscription_type   = EXCLUDED.subscription_type,
      subscription_expiry = EXCLUDED.subscription_expiry,
      joined_at           = EXCLUDED.joined_at
  `
  return await getUser(key)
}

export async function updateUser(username, updates) {
  const key  = username.toLowerCase()
  const rows = await sql`SELECT 1 FROM app_users WHERE username = ${key}`
  if (!rows.length) return false

  // One explicit UPDATE per possible field — keeps parameterised queries safe
  const u = updates
  if ('name'               in u) await sql`UPDATE app_users SET name                = ${u.name}                                         WHERE username = ${key}`
  if ('avatar'             in u) await sql`UPDATE app_users SET avatar              = ${u.avatar}                                       WHERE username = ${key}`
  if ('role'               in u) await sql`UPDATE app_users SET role                = ${u.role}                                         WHERE username = ${key}`
  if ('passwordHash'       in u) await sql`UPDATE app_users SET password_hash       = ${u.passwordHash}                                 WHERE username = ${key}`
  if ('photo'              in u) await sql`UPDATE app_users SET photo               = ${u.photo}                                        WHERE username = ${key}`
  if ('phone'              in u) await sql`UPDATE app_users SET phone               = ${u.phone}                                        WHERE username = ${key}`
  if ('gender'             in u) await sql`UPDATE app_users SET gender              = ${u.gender}                                       WHERE username = ${key}`
  if ('allowedCourse'      in u) await sql`UPDATE app_users SET allowed_course      = ${u.allowedCourse}                                WHERE username = ${key}`
  if ('subscriptionType'   in u) await sql`UPDATE app_users SET subscription_type   = ${u.subscriptionType}                             WHERE username = ${key}`
  if ('subscriptionExpiry' in u) await sql`UPDATE app_users SET subscription_expiry = ${u.subscriptionExpiry}                           WHERE username = ${key}`
  if ('progress'           in u) await sql`UPDATE app_users SET progress            = ${JSON.stringify(u.progress)}::jsonb              WHERE username = ${key}`
  if ('quizScores'         in u) await sql`UPDATE app_users SET quiz_scores         = ${JSON.stringify(u.quizScores)}::jsonb            WHERE username = ${key}`
  if ('notes'              in u) await sql`UPDATE app_users SET notes               = ${JSON.stringify(u.notes)}::jsonb                 WHERE username = ${key}`
  if ('softDeleted'        in u) await sql`UPDATE app_users SET soft_deleted        = ${u.softDeleted}                                  WHERE username = ${key}`
  if ('softDeletedAt'      in u) await sql`UPDATE app_users SET soft_deleted_at     = ${u.softDeletedAt}                                WHERE username = ${key}`
  if ('passwordChangedAt'  in u) await sql`UPDATE app_users SET password_changed_at = ${u.passwordChangedAt}                           WHERE username = ${key}`
  if ('joinedAt'           in u) await sql`UPDATE app_users SET joined_at           = ${u.joinedAt}                                    WHERE username = ${key}`
  if ('lastLoginAt'        in u) await sql`UPDATE app_users SET last_login_at       = ${u.lastLoginAt}                                 WHERE username = ${key}`
  if ('lastActiveAt'       in u) await sql`UPDATE app_users SET last_active_at      = ${u.lastActiveAt}                                WHERE username = ${key}`

  return true
}

export async function deleteUser(username) {
  await sql`DELETE FROM app_users WHERE username = ${username.toLowerCase()}`
}
