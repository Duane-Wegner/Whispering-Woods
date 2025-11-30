/**
 * Admin model: overlay management
 * Provides CRUD helpers for a local overlay applied on top of base rooms.json.
 * The overlay is persisted in localStorage and merged at runtime by state.js.
 */
import { load, save } from '../storage.js';

const OVERLAY_KEY = 'admin:overlay:v1';

/** Load overlay from localStorage or return an empty structure. */
export function getOverlay() {
  return load(OVERLAY_KEY, { rooms: {} });
}

/** Persist overlay changes back to localStorage. */
export function saveOverlay(overlay) {
  save(OVERLAY_KEY, overlay);
}

/**
 * Combine base room ids and overlay ids, returning merged room previews.
 * @param {{ rooms: Record<string, any> }} baseData
 * @param {{ rooms?: Record<string, any> }} overlay
 * @returns {Array<{ id:string, room:any }>} Sorted by id.
 */
export function listRooms(baseData, overlay) {
  const ids = new Set([...Object.keys(baseData.rooms), ...Object.keys(overlay.rooms || {})]);
  return [...ids].sort().map(id => ({ id, room: { ...baseData.rooms[id], ...overlay.rooms?.[id] } }));
}

// Developer note on merge semantics:
// - listRooms and the overlay apply logic perform a shallow merge: fields present
//   in the overlay override base room fields. Exits (maps) are merged by code in
//   state.js to allow adding/modifying single exits without re-specifying all exits.
// - Currently deleting an overlay entry via deleteRoom simply removes the overlay
//   entry so the base room (if present) becomes visible again. If you want true
//   deletions (hide/remove base rooms), adopt a `removed: true` convention in the
//   overlay and update the merge logic in state.js to skip rooms marked removed.

/** Insert or update a room entry in the overlay. */
export function upsertRoom(overlay, id, patch) {
  overlay.rooms = overlay.rooms || {};
  // Ensure rooms map exists, then shallow-merge the incoming patch
  overlay.rooms[id] = { ...(overlay.rooms[id] || {}), ...patch };
}

/** Remove a room entry from the overlay (reverts to base data if present). */
export function deleteRoom(overlay, id) {
  if (overlay.rooms) {
  // Deleting removes the override so base data (if any) shows through
    delete overlay.rooms[id];
  }
}

/** Export overlay as formatted JSON string. */
export function exportOverlay(overlay) {
  return JSON.stringify(overlay, null, 2);
}
