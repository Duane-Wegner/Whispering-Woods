/**
 * State module
 * Initialize and persist game state, and load room data.
 *
 * Responsibilities:
 * - Fetch rooms.json (base data)
 * - Apply admin overlay from localStorage (non-destructive)
 * - Create/load/save player state (current room, visited, inventory)
 */
import { load, save, clearSave as clearAll } from './storage.js';

export const SAVE_KEY = 'save:v1';

export async function loadData() {
  /**
   * Fetch base room data and apply local admin overlay if present.
   * @returns {Promise<{ startingRoom: string, rooms: Record<string, any> }>} Resolved game data.
   * @throws {Error} If rooms.json fails to load.
   */
  // no-store: ensure fresh data when admin overlay changes have been made
  const res = await fetch('./data/rooms.json', { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to load rooms.json');
  const base = await res.json();
  return applyOverlay(base);
}

export function defaultState(data) {
  /**
   * Create a fresh game state for the given data model.
   * @param {{ startingRoom: string, rooms: Record<string, any> }} data
   * @returns {{ version:number, current:string, visited:Record<string,boolean>, inventory:string[], rooms:Record<string,any>, log:string[] }}
   */
  const { startingRoom, rooms } = data;
  return {
    version: 1,
    current: startingRoom,
    // visited as a simple dictionary for O(1) membership checks
    visited: { [startingRoom]: true },
    inventory: [],
    // Keep our own copy so collecting an item nulls it out without touching base data
    rooms: structuredClone(rooms),
    log: [
      'Welcome to the Whispering Woods. Collect all six items and face Darkroot.',
    ],
  };
}

export function loadState(data) {
  /**
   * Load a previously saved state or fall back to a new default state.
   * Performs a light shape validation.
   * @param {{ startingRoom: string, rooms: Record<string, any> }} data
   * @returns {object} Restored or default state object.
   */
  const saved = load(SAVE_KEY);
  if (!saved) return defaultState(data);
  // Minimal schema validation: if critical keys are missing, start fresh
  if (!saved.rooms || !saved.current || !saved.visited) {
    return defaultState(data);
  }
  return saved;
}

export function saveState(state) {
  /**
   * Persist current state to localStorage.
   * @param {object} state
   * @returns {void}
   */
  save(SAVE_KEY, state);
}

export function clearSave() {
  /**
   * Clear all namespaced storage, including the save slot.
   * @returns {void}
   */
  clearAll();
}

// Load and apply admin overlay if present. Overlay format:
// { startingRoom?: string, rooms?: { [id]: Partial<Room> } }
/**
 * Apply local admin overlay to base data without mutating input.
 * Overlay format: { startingRoom?: string, rooms?: { [id]: Partial<Room> } }
 * @param {{ startingRoom:string, rooms:Record<string, any> }} data
 * @returns {{ startingRoom:string, rooms:Record<string, any> }}
 */
function applyOverlay(data) {
  const overlay = load('admin:overlay:v1', null);
  if (!overlay) return data;
  // Work on a clone to keep base data immutable
  const result = structuredClone(data);
  if (overlay.startingRoom && result.rooms[overlay.startingRoom]) {
    // Allow admin to change the starting room only if it exists
    result.startingRoom = overlay.startingRoom;
  }
  if (overlay.rooms && typeof overlay.rooms === 'object') {
    for (const [id, patch] of Object.entries(overlay.rooms)) {
      if (!result.rooms[id]) {
        // New room entirely: provide safe defaults and apply patch fields
        result.rooms[id] = { name: id, desc: '', exits: {}, item: null, pos: [0, 0], ...patch };
      } else {
        // Patch existing fields shallowly; overlay takes precedence
        result.rooms[id] = { ...result.rooms[id], ...patch };
        // Merge exits map if provided instead of replacing the whole thing
        if (patch.exits) {
          result.rooms[id].exits = { ...result.rooms[id].exits, ...patch.exits };
        }
      }
    }
  }
  // Note: overlay does not currently support deleting a base room entirely.
  // To 'remove' a base room, an overlay consumer could set its exits to {} and
  // leave it unreachable; for true removal we would add a 'removed: true' flag
  // and have applyOverlay filter such rooms out.
  return result;
}
