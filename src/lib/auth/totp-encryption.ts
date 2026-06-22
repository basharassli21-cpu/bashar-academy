import "server-only";
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

const secretKey = process.env.JWT_SECRET;
if (!secretKey) {
  throw new Error("JWT_SECRET environment variable is not set");
}

// Derived from JWT_SECRET with a fixed context string so the two secrets
// serve cryptographically distinct purposes despite sharing one source key.
const encryptionKey = createHash("sha256").update(`totp-secret-encryption:${secretKey}`).digest();

export function encryptTotpSecret(plainSecret: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey, iv);
  const encrypted = Buffer.concat([cipher.update(plainSecret, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([iv, authTag, encrypted]).toString("base64");
}

export function decryptTotpSecret(stored: string): string {
  const data = Buffer.from(stored, "base64");
  const iv = data.subarray(0, 12);
  const authTag = data.subarray(12, 28);
  const encrypted = data.subarray(28);
  const decipher = createDecipheriv("aes-256-gcm", encryptionKey, iv);
  decipher.setAuthTag(authTag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
}
