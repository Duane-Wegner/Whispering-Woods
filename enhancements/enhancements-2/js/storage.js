/**
 * Storage utilities
 * Lightweight wrapper around localStorage with a stable namespace.
 *
 * Design:
 * - All keys are prefixed to avoid clashing with other projects
 * - JSON serialize/parse; callers handle shape/versioning
 */

const NAMESPACE = 'ww:enh1';

export function load(key, fallback = null) {
  /**
   * Load a JSON value from localStorage.
   * @param {string} key - Key without namespace prefix.
   * @param {*} [fallback=null] - Value returned if missing or parse fails.
   * @returns {*} Parsed value or fallback.
   */
  try {
    const raw = localStorage.getItem(`${NAMESPACE}:${key}`);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function save(key, value) {
  /**
   * Save a JSON-serializable value to localStorage.
   * @param {string} key - Key without namespace prefix.
   * @param {*} value - Any JSON-serializable value.
   * @returns {void}
   */
  localStorage.setItem(`${NAMESPACE}:${key}`, JSON.stringify(value));
}

export function clearSave() {
  /**
   * Remove all keys under this module's namespace from localStorage.
   * Useful for a full game reset.
   * @returns {void}
   */
  Object.keys(localStorage)
    .filter(k => k.startsWith(`${NAMESPACE}:`))
    .forEach(k => localStorage.removeItem(k));
}

// Notes:
// - Keys are stored as "ww:enh1:<key>" so this module can be reused safely
//   alongside other apps that might use localStorage.
// - We avoid throwing from these helpers so UI code can remain simple.
