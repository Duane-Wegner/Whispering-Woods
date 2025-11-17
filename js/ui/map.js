/**
 * Map UI
 * Renders a simple grid from room positions, highlighting visited cells
 * and the player's current location. Unknown cells remain subdued.
 */

/**
 * Render the exploration map grid.
 * @param {HTMLElement} el - Container for the map grid.
 * @param {{ rooms: Record<string,{pos:number[],name:string}> }} data
 * @param {{ current:string, visited: Record<string,boolean> }} state
 *
 * Developer notes about shapes and behavior:
 * - data.rooms is a map keyed by room id. Each room: { id, name, pos: [x,y], exits?, items? }
 * - state.visited is a plain object used as a quick lookup: { '<roomId>': true }
 * - state.current is the id of the room the player is in currently.
 *
 * The renderer normalizes coordinates to create a compact CSS grid, adds one cell per
 * logical coordinate, and marks cells with CSS classes: .unknown, .visited, .current.
 * For larger maps, consider rendering only a viewport window to avoid DOM bloat.
 */
export function renderMap(el, data, state) {
  const entries = Object.entries(data.rooms);
  const coords = entries.map(([id, r]) => ({ id, x: r.pos?.[0] ?? 0, y: r.pos?.[1] ?? 0 }));
  const minX = Math.min(...coords.map(c => c.x));
  const maxX = Math.max(...coords.map(c => c.x));
  const minY = Math.min(...coords.map(c => c.y));
  const maxY = Math.max(...coords.map(c => c.y));
  const cols = maxX - minX + 1;
  const rows = maxY - minY + 1;
  // CSS grid column count; each cell is rendered as a div
  el.style.setProperty('--cols', String(cols));
  el.innerHTML = '';

  // Build a map from (x,y) -> room id
  const byCoord = new Map();
  coords.forEach(c => byCoord.set(`${c.x},${c.y}`, c.id));

  // Draw from top row (maxY) down to bottom (minY) for intuitive Cartesian view
  for (let y = maxY; y >= minY; y--) {
    for (let x = minX; x <= maxX; x++) {
      const id = byCoord.get(`${x},${y}`);
      const div = document.createElement('div');
      div.className = 'map-cell';
      if (!id) {
        div.classList.add('unknown');
        el.appendChild(div);
        continue;
      }
      // Style based on discovery and current position
      const visited = !!state.visited[id];
      if (visited) div.classList.add('visited'); else div.classList.add('unknown');
      if (state.current === id) div.classList.add('current');
      const dot = document.createElement('div');
      dot.className = 'dot';
      div.title = data.rooms[id].name;
      div.appendChild(dot);
      el.appendChild(div);
    }
  }
}
