// lib/r2-presign.js — Cloudflare R2 presigned URL generator (S3v4 signing, no extra deps)
import { createHmac, createHash } from 'node:crypto'

const hmac = (key, msg) => createHmac('sha256', key).update(msg).digest()
const sha256 = (msg) => createHash('sha256').update(msg).digest('hex')

/**
 * Returns a presigned GET URL for a private R2 object, or null if env vars are missing.
 *
 * Required env vars:
 *   R2_ENDPOINT          — https://<accountid>.r2.cloudflarestorage.com
 *   R2_BUCKET            — bucket name
 *   R2_ACCESS_KEY_ID     — R2 API token key ID
 *   R2_SECRET_ACCESS_KEY — R2 API token secret
 *
 * @param {string} key       — object key inside the bucket (e.g. "videos/lesson1.mp4")
 * @param {number} expiresIn — seconds until expiry (default 4 hours)
 */
export function presignR2(key, expiresIn = 4 * 3600) {
  const endpoint  = process.env.R2_ENDPOINT
  const bucket    = process.env.R2_BUCKET
  const accessKey = process.env.R2_ACCESS_KEY_ID
  const secretKey = process.env.R2_SECRET_ACCESS_KEY

  if (!endpoint || !bucket || !accessKey || !secretKey) return null

  const host     = new URL(endpoint).host
  const region   = 'auto'
  const service  = 's3'
  const now      = new Date()
  const dateTime = now.toISOString().replace(/[-:.]/g, '').slice(0, 15) + 'Z'
  const dateOnly = dateTime.slice(0, 8)

  const credentialScope = `${dateOnly}/${region}/${service}/aws4_request`
  const credential      = `${accessKey}/${credentialScope}`

  // Canonical query string — params must be sorted
  const qp = new URLSearchParams([
    ['X-Amz-Algorithm',     'AWS4-HMAC-SHA256'],
    ['X-Amz-Credential',    credential],
    ['X-Amz-Date',          dateTime],
    ['X-Amz-Expires',       String(expiresIn)],
    ['X-Amz-SignedHeaders', 'host'],
  ])
  // URLSearchParams already serializes in insertion order; params above are sorted

  const canonicalRequest = [
    'GET',
    `/${bucket}/${key}`,
    qp.toString(),
    `host:${host}\n`,
    'host',
    'UNSIGNED-PAYLOAD',
  ].join('\n')

  const stringToSign = [
    'AWS4-HMAC-SHA256',
    dateTime,
    credentialScope,
    sha256(canonicalRequest),
  ].join('\n')

  const signingKey = hmac(
    hmac(hmac(hmac(Buffer.from(`AWS4${secretKey}`, 'utf8'), dateOnly), region), service),
    'aws4_request'
  )
  const signature = createHmac('sha256', signingKey).update(stringToSign).digest('hex')

  qp.set('X-Amz-Signature', signature)
  return `${endpoint}/${bucket}/${key}?${qp.toString()}`
}
