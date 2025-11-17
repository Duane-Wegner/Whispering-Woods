/**
 * Status/UI helpers
 * Small utilities to update room header/desc, append to the activity log,
 * surface alert messages, and control the endgame modal visibility.
 */
/**
 * Update the room header and optional subtext.
 * @param {string} name
 * @param {string} [sub]
 */
export function setRoomHeader(name, sub) {
  const h = document.getElementById('room-name');
  const s = document.getElementById('room-sub');
  if (h) h.textContent = name;
  if (s) s.textContent = sub ?? '';
}

/**
 * Set the room description paragraph.
 * @param {string} desc
 */
export function setRoomDesc(desc) {
  const p = document.getElementById('room-desc');
  if (p) p.textContent = desc ?? '';
}

/**
 * Append a message to the activity log and scroll to bottom.
 * @param {string} message
 */
export function pushLog(message) {
  const log = document.getElementById('log');
  const p = document.createElement('p');
  p.textContent = message;
  log?.appendChild(p);
  // Keep the most recent message visible
  log?.scrollTo({ top: log.scrollHeight });
}

/**
 * Display a transient alert in the alerts region (aria-live).
 * @param {string} message
 */
export function alertWarn(message) {
  const alerts = document.getElementById('alerts');
  // alerts region is aria-live in the DOM for screen reader announcement
  if (alerts) alerts.textContent = message ?? '';
}

export function clearAlert() {
  /** Clear any alert text. */
  const alerts = document.getElementById('alerts');
  if (alerts) alerts.textContent = '';
}

/**
 * Show the endgame modal with title and body.
 * @param {string} title
 * @param {string} body
 */
export function showModal(title, body) {
  const modal = document.getElementById('modal');
  const mt = document.getElementById('modal-title');
  const mb = document.getElementById('modal-body');
  if (mt) mt.textContent = title;
  if (mb) mb.textContent = body;
  modal?.classList.remove('hidden');
  // Accessibility note: we do not trap focus here because the modal is simple
  // and has a single primary action. If the modal becomes interactive (inputs,
  // multiple actions), add focus trap and restore focus on hide.
}

export function hideModal() {
  /** Hide the endgame modal. */
  const modal = document.getElementById('modal');
  modal?.classList.add('hidden');
}
