/**
 * Game rules
 * Core logic for movement, item pickup, reset, and win/lose checks.
 * Pure functions mutate a shared state object and return small result structs.
 */

import { saveState } from './state.js';
import { bfsPath, bfsNearestWithItem, reachableRooms, immediateNeighbors, reachableWithin } from './algorithms.js';

export function getAvailableExits(state) {
  /**
   * Get exits for the current room.
   * @param {object} state - Game state.
   * @returns {Record<string,string>} Mapping of direction -> room id
   */
  const room = state.rooms[state.current];
  return room ? room.exits : {};
}

export function move(state, direction) {
  /**
   * Attempt to move the player in a direction.
   * @param {object} state - Game state (mutated on success).
   * @param {"North"|"South"|"East"|"West"} direction
   * @returns {{ ok: false, message: string } | { ok: true } | { ok:true, end:"win"|"lose" }}
   */
  const exits = getAvailableExits(state);
  const next = exits[direction];
  if (!next) return { ok: false, message: `Cannot move ${direction} from here.` };

  // Update position and visitation state
  state.current = next;
  state.visited[next] = true;
  // record path history for later analysis/UI
  if (!Array.isArray(state.pathHistory)) state.pathHistory = [];
  state.pathHistory.push(next);
  const room = state.rooms[next];
  state.log.push(`Moved ${direction} to ${room?.name ?? next}.`);

  // Shadow Hollow check
  if (room && room.name === 'Shadow Hollow') {
    return resolveShadowHollow(state);
  }

  saveState(state);
  return { ok: true };
}

// Algorithmic helpers
export function findPath(state, target) {
  // Return shortest path from current to target (inclusive) or null
  return bfsPath(state.rooms, state.current, target);
}

export function findNearestItemPath(state) {
  // Return an array of paths (possibly empty) representing the nearest acquirable
  // items. Each path is an array of room ids from current -> target.
  return bfsNearestWithItem(state.rooms, state.current, state.inventory || []);
}

export function listReachable(state) {
  return reachableRooms(state.rooms, state.current);
}

export function findImmediateNeighbors(state) {
  return immediateNeighbors(state.rooms, state.current);
}

export function findReachableWithin(state, maxDepth = 1) {
  return reachableWithin(state.rooms, state.current, maxDepth);
}

export function canGetItem(state) {
  /**
   * Whether the current room has an item available to collect.
   * @param {object} state
   * @returns {boolean}
   */
  const room = state.rooms[state.current];
  return !!(room && room.item);
}

export function getItem(state) {
  /**
   * Collect the item in the current room, if present, and persist state.
   * @param {object} state
   * @returns {{ ok:false, message:string } | { ok:true, item:string }}
   */
  const room = state.rooms[state.current];
  const item = room?.item;
  if (!item) return { ok: false, message: 'No item in this room.' };
  // Push to inventory and clear item from the room
  state.inventory.push(item);
  state.rooms[state.current].item = null;
  state.log.push(`Acquired ${item}.`);
  saveState(state);
  return { ok: true, item };
}

export function resetGame(state, data) {
  /**
   * Reset the running state in-place to the initial defaults from data.
   * @param {object} state - Game state (mutated).
   * @param {{ startingRoom:string, rooms:Record<string,any> }} data
   * @returns {void}
   */
  // Reinitialize to default while keeping reference
  const { startingRoom, rooms } = data;
  state.version = 1;
  state.current = startingRoom;
  // Reset visited to only the starting room
  state.visited = { [startingRoom]: true };
  state.inventory = [];
  state.rooms = structuredClone(rooms);
  state.log = ['Game reset. Welcome back to the Whispering Woods.'];
  saveState(state);
}

export function resolveShadowHollow(state) {
  /**
   * Handle endgame resolution when entering Shadow Hollow.
   * @param {object} state
   * @returns {{ ok:true, end:'win'|'lose' }}
   */
  const win = state.inventory.length >= 6;
  if (win) {
    state.log.push('With all six items, you confront and defeat Darkroot.');
    saveState(state);
    return { ok: true, end: 'win' };
  } else {
    state.log.push('You face Darkroot unprepared and are defeated.');
    saveState(state);
    return { ok: true, end: 'lose' };
  }
}
