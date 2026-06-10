import { createHash, randomBytes, timingSafeEqual } from "crypto";

/**
 * Generate a cryptographically secure random hex token.
 * @param bytes Number of random bytes (default 32 → 64 hex chars)
 */
export function generateToken(bytes = 32): string {
  return randomBytes(bytes).toString("hex");
}

/**
 * SHA-256 hash a token for safe database storage.
 * The raw token travels only in the email link; the hash lives in the DB.
 */
export function hashToken(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

/**
 * Generate a raw token AND its hash in one call.
 * Returns { raw, hashed } — store hashed, send raw.
 */
export function generateAndHashToken(bytes = 32): {
  raw: string;
  hashed: string;
} {
  const raw = generateToken(bytes);
  return { raw, hashed: hashToken(raw) };
}

/**
 * Constant-time comparison of two hashes.
 */
export function safeEqual(a: string, b: string): boolean {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);

  if (aBuf.length !== bBuf.length) {
    return false;
  }

  return timingSafeEqual(aBuf, bBuf);
}
