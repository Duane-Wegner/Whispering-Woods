/**
 * Admin authentication (local-only)
 * Stores a SHA-256 hash of a user-defined password in localStorage and
 * maintains a session flag in sessionStorage. This is for demo purposes
 * only and not intended for production security.
 *
 * Threat model / notes:
 * - This provides convenience-only protection for a local admin overlay. The
 *   stored hash can be read by anyone with access to the browser profile or
 *   machine. It does not secure the app over the network, and should not be
 *   considered a real authentication layer.
 * - If you move to a server-backed admin, replace these helpers with server
 *   APIs and remove any secret material from localStorage.
 */
import { load, save } from '../storage.js';

const PWD_KEY = 'admin:pwdhash:v1';
const SESSION_KEY = 'admin:session:v1';

/**
 * Hash a string using SHA-256 via Web Crypto API.
 */
export async function sha256(str) {
  const enc = new TextEncoder();
  const buf = await crypto.subtle.digest('SHA-256', enc.encode(str));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
}

// Note: Web Crypto returns a promise; we do not add a synchronous fallback here.
// All callers should await sha256(...).

export function hasPassword() {
  /**
   * Whether an admin password hash is set in localStorage.
   * @returns {boolean}
   */
  return !!load(PWD_KEY);
}

/** Save the hash of the new admin password. */
export async function setPassword(password) {
  const hash = await sha256(password);
  save(PWD_KEY, hash);
}

/**
 * Validate provided password against stored hash and start session.
 * Returns true on success.
 */
export async function login(password) {
  const hash = await sha256(password);
  const stored = load(PWD_KEY);
  if (stored && stored === hash) {
    // Use sessionStorage for a per-tab session that clears on tab close
    sessionStorage.setItem(SESSION_KEY, '1');
    return true;
  }
  return false;
}

export function isAuthed() {
  /**
   * Whether an admin session is active in this tab.
   * @returns {boolean}
   */
  return sessionStorage.getItem(SESSION_KEY) === '1';
}

export function logout() {
  /** End the admin session in this tab. */
  sessionStorage.removeItem(SESSION_KEY);
}
