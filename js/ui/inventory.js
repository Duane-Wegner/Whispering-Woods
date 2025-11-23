/**
 * Inventory UI
 * Displays collected items with simple inline SVG icons and a count badge.
 */
/*
 * Notes:
 * - Item identity is a plain string (e.g. 'Silver Axe'). The game state keeps
 *   inventory as an array of those strings. If you want stackable items later,
 *   change to an array of { id, qty } objects and update renderInventory accordingly.
 * - Icons are provided by a small map above. To add an icon for a new item:
 *   1) add a named SVG in the `map` inside svgIcon(),
 *   2) add an entry in the `icons` map keyed by the exact item string.
 */
const icons = {
  'Silver Axe': svgIcon('axe'),
  'Sunlight Elixir': svgIcon('elixir'),
  'Ancient Rune': svgIcon('rune'),
  'Barkskin Potion': svgIcon('potion'),
  'Druidic Staff': svgIcon('staff'),
  'Cloak': svgIcon('cloak'),
};

/**
 * Get a simple inline SVG icon by kind.
 * @param {string} kind
 * @returns {string} SVG markup
 */
function svgIcon(kind) {
  // simple inline SVGs (monotone) sized via CSS
  const map = {
    axe: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M3 21l6-6 2 2-6 6H3v-2zM14.7 3.3l6 6-3.4 3.4-6-6L14.7 3.3zm-2.8 4.2l4.6 4.6-6.2 6.2-4.6-4.6 6.2-6.2z"/></svg>',
    elixir: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M10 3h4v2h-1v2.1c1.7.5 3 2.1 3 3.9 0 2.2-1.8 4-4 4s-4-1.8-4-4c0-1.8 1.3-3.4 3-3.9V5h-1V3zM6 19c0-2.2 3.6-4 8-4s8 1.8 8 4v2H6v-2z"/></svg>',
    rune: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2l7 4v12l-7 4-7-4V6l7-4zm0 2.2L7 6.7v10.6l5 2.8 5-2.8V6.7L12 4.2zm-1 3.3h2v9h-2v-9z"/></svg>',
    potion: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M9 2h6v2h-1v3.1l3.6 5.8A5 5 0 0 1 12 21a5 5 0 0 1-5.6-8.1L10 7.1V4H9V2z"/></svg>',
    staff: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a5 5 0 0 1 5 5c0 2.8-2.2 5-5 5-1 0-1.9-.3-2.7-.7l-5.3 9.4-1.7-1 5.2-9.2A5 5 0 0 1 12 2z"/></svg>',
    cloak: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2c2 0 4 1 5 3l3 7-5 10H9L4 12l3-7c1-2 3-3 5-3z"/></svg>',
  };
  return map[kind] || '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8" fill="currentColor"/></svg>';
}

/**
 * Render the inventory list and progress badge.
 * @param {HTMLElement} el - UL element to populate.
 * @param {{ inventory: string[] }} state
 */
export function renderInventory(el, state) {
  // Clear and rebuild list from current inventory state
  el.innerHTML = '';
  state.inventory.forEach((item) => {
    const li = document.createElement('li');
    li.className = 'item';
    const icon = document.createElement('span');
    icon.className = 'item-icon';
    icon.innerHTML = icons[item] || svgIcon('unknown');
    const label = document.createElement('span');
    label.className = 'item-label';
    label.textContent = item;
    li.appendChild(icon);
    li.appendChild(label);
    el.appendChild(li);
  });
  // Update small badge to show progress toward 6 items
  const badge = document.getElementById('inv-count');
  if (badge) badge.textContent = `${state.inventory.length}/6`;
}
