import CryptoJS from "crypto-js";

// Shared secret used to encrypt the company Users URL into an API key.
// IMPORTANT: This MUST match the exact same secret used by the mobile app
// (apexflowERPMobileApp/cbass-ai/constants/config.ts -> LINK_SECRET).
export const LINK_SECRET = "change-me-to-match-web-admin-secret";

/**
 * Encrypts a link/URL into an opaque API key string using AES.
 *
 * This is the counterpart to the mobile app's decryptLink(): the key produced
 * here is what an end user pastes into the mobile app, which then decrypts it
 * back into this same URL using the same secret.
 */
export function encryptLink(url) {
  const trimmed = (url || "").trim();
  if (!trimmed) return "";
  return CryptoJS.AES.encrypt(trimmed, LINK_SECRET).toString();
}

/**
 * Decrypts a key string back into the original URL. Provided for completeness
 * (e.g. to verify a key on the admin side). Returns "" if it cannot decrypt.
 */
export function decryptLink(key) {
  const trimmed = (key || "").trim();
  if (!trimmed) return "";
  try {
    const bytes = CryptoJS.AES.decrypt(trimmed, LINK_SECRET);
    return bytes.toString(CryptoJS.enc.Utf8).trim();
  } catch {
    return "";
  }
}
