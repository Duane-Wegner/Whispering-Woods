/**
 * algorithms.js
 * Small collection of graph algorithms used by the game.
 */

/**
 * Find shortest path between two nodes in an unweighted graph using BFS.
 * @param {Record<string, {exits: Record<string,string>}>} rooms
 * @param {string} start
 * @param {string} goal
 * @returns {string[] | null} path as list of room ids from start to goal (inclusive), or null if unreachable
 */
export function bfsPath(rooms, start, goal) {
  // Complexity: O(V + E) time, O(V) additional space for the `prev` map and queue.
  // Explanation: Each node and edge is visited at most once by BFS; reconstructing
  // the path takes up to O(V) time in the worst case.
  if (start === goal) return [start];
  const q = [start];
  const prev = new Map();
  prev.set(start, null);
  while (q.length) {
    const node = q.shift();
    const room = rooms[node];
    if (!room) continue;
    for (const dir of Object.keys(room.exits || {})) {
      const neighbor = room.exits[dir];
      if (!prev.has(neighbor)) {
        prev.set(neighbor, node);
        if (neighbor === goal) {
          // reconstruct
          const path = [goal];
          let cur = node;
          while (cur !== null) { path.unshift(cur); cur = prev.get(cur); }
          return path;
        }
        q.push(neighbor);
      }
    }
  }
  return null;
}

/**
 * Find nearest room that contains an item using BFS from start.
 * Returns the path to that room.
 * @param {Record<string, any>} rooms
 * @param {string} start
 * @param {string[]|Set<string>|null} [ownedItems] Optional list or set of item names the player already owns. If provided,
 * the search will ignore rooms whose item is already owned (useful when highlighting reachable items the player can still get).
 * @returns {string[] | null}
 */
export function bfsNearestWithItem(rooms, start, ownedItems = null) {
  // Complexity: O(V + E) time, O(V) space for `prev` and queue.
  // This variant collects all rooms that contain an acquirable item at the
  // minimum distance from `start` and returns an array of paths (each path is
  // an array of room ids from start -> target). Returns an empty array if none.
  let ownedSet = null;
  if (ownedItems) {
    ownedSet = ownedItems instanceof Set ? ownedItems : new Set(ownedItems);
  }

  const q = [start];
  const prev = new Map();
  prev.set(start, null);

  // Standard BFS but process by levels: when we find any valid item at a
  // level, collect all valid items in that same level and stop.
  while (q.length) {
    const levelSize = q.length;
    const found = [];
    for (let i = 0; i < levelSize; i++) {
      const node = q.shift();
      const room = rooms[node];
      if (!room) continue;
      const item = room.item;
      if (item && (!ownedSet || !ownedSet.has(item))) {
        found.push(node);
      }
      for (const dir of Object.keys(room.exits || {})) {
        const neighbor = room.exits[dir];
        if (!prev.has(neighbor)) {
          prev.set(neighbor, node);
          q.push(neighbor);
        }
      }
    }
    if (found.length) {
      // reconstruct paths for every found node
      const paths = found.map(node => {
        const path = [node];
        let cur = prev.get(node);
        while (cur !== null) { path.unshift(cur); cur = prev.get(cur); }
        return path;
      });
      return paths;
    }
  }
  return [];
}

/**
 * Return a list of reachable rooms from start using BFS (no weights).
 * @param {Record<string, any>} rooms
 * @param {string} start
 * @returns {string[]}
 */
export function reachableRooms(rooms, start) {
  // Complexity: O(V + E) time, O(V) space for the seen set and queue.
  // Returns the set of rooms reachable from `start` using BFS traversal.
  const res = [];
  const seen = new Set([start]);
  const q = [start];
  while (q.length) {
    const node = q.shift();
    res.push(node);
    const room = rooms[node];
    if (!room) continue;
    for (const dir of Object.keys(room.exits || {})) {
      const neighbor = room.exits[dir];
      if (!seen.has(neighbor)) { seen.add(neighbor); q.push(neighbor); }
    }
  }
  return res;
}

/**
 * Return the immediate neighbors (one-step exits) from `start`.
 * Complexity: O(d) where d is the number of exits from the start room (usually small).
 * @param {Record<string, any>} rooms
 * @param {string} start
 * @returns {string[]} array of room ids directly reachable from `start`
 */
export function immediateNeighbors(rooms, start) {
  const room = rooms[start];
  if (!room) return [];
  return Object.values(room.exits || {});
}

/**
 * Return rooms reachable within `maxDepth` steps from `start` (inclusive of distance 1..maxDepth).
 * Complexity: O(min(V, branching^maxDepth)) time in practice; worst-case O(V + E) if maxDepth is large.
 * Useful for depth-limited queries.
 * @param {Record<string, any>} rooms
 * @param {string} start
 * @param {number} maxDepth
 * @returns {string[]}
 */
export function reachableWithin(rooms, start, maxDepth = 1) {
  if (maxDepth <= 0) return [];
  const seen = new Set([start]);
  let frontier = [start];
  let depth = 0;
  const results = new Set();
  while (frontier.length && depth < maxDepth) {
    const next = [];
    for (const node of frontier) {
      const room = rooms[node];
      if (!room) continue;
      for (const dir of Object.keys(room.exits || {})) {
        const nb = room.exits[dir];
        if (!seen.has(nb)) {
          seen.add(nb);
          next.push(nb);
          results.add(nb);
        }
      }
    }
    frontier = next;
    depth++;
  }
  return Array.from(results);
}
