/**
 * Main entry for the game page
 * Wires data/state to UI, handles input (buttons/keyboard), and modal flows.
 */
import { loadData, loadState, saveState, clearSave } from './state.js';
import { getAvailableExits, move, canGetItem, getItem, resetGame, findNearestItemPath, findImmediateNeighbors, findReachableWithin } from './game.js';
import { renderMap } from './ui/map.js';
import { renderInventory } from './ui/inventory.js';
import { setRoomHeader, setRoomDesc, pushLog, alertWarn, clearAlert, showModal, hideModal } from './ui/status.js';

let DATA = null; // rooms.json
let STATE = null; // live game state

/** Initialize game: load data/state, render UI, and show intro if needed. */
async function init() {
  // Load base+overlay room data and player state
  DATA = await loadData();
  STATE = loadState(DATA);
  // First render
    // Render order is important: map first (positions), then controls/header, then inventory/equipment.
    // Map rendering establishes the visual grid; control buttons depend on current room exits.
    renderAll();
  hookControls();
  announceCurrent();
  showIntroIfNeeded();
}

/** Render all visible UI sections from current DATA and STATE. */
function renderAll() {
  const mapEl = document.getElementById('map');
  renderMap(mapEl, DATA, STATE);

  const currentRoom = DATA.rooms[STATE.current];
  // Derive exits for the current room to drive header text and button states
  const exits = getAvailableExits(STATE);
  setRoomHeader(currentRoom.name, exitSummary(exits));
  setRoomDesc(currentRoom.desc);
  updateControls(exits);
  renderInventory(document.getElementById('inventory'), STATE);
  renderEquip();

  // Moonlight Clearing warning
  if (currentRoom.name === 'Moonlight Clearing' && STATE.inventory.length < 6) {
    alertWarn('You hear a distant, heavy thudding from the North…');
  } else {
    clearAlert();
  }
}

function exitSummary(exits) {
  const dirs = Object.keys(exits);
  return dirs.length ? `Exits: ${dirs.join(', ')}` : 'No exits';
}

function updateControls(exits) {
  const btns = [
    ['North', 'btn-n'],
    ['South', 'btn-s'],
    ['East', 'btn-e'],
    ['West', 'btn-w'],
  ];
  btns.forEach(([dir, id]) => {
    const b = document.getElementById(id);
    if (b) b.disabled = !exits[dir];
  });
  const can = canGetItem(STATE);
  const getBtn = document.getElementById('btn-get');
  if (getBtn) getBtn.disabled = !can;
}

  // Notes:
  // - `exits` is a plain object mapping cardinal directions to room ids. Example: { North: 'Murky Path' }
  // - Buttons are enabled/disabled based on presence of that key. This keeps UI synchronous
  //   with the in-memory state and avoids querying the DOM for room data repeatedly.

/** Wire up movement, items, reset buttons, and keyboard listeners. */
function hookControls() {
  // Movement
  document.querySelectorAll('.btn.dir').forEach(btn => {
    btn.addEventListener('click', () => onMove(btn.getAttribute('data-dir')));
  });
  // Keyboard arrows/WASD
  window.addEventListener('keydown', (e) => {
    // Key-to-direction mapping including WASD (uppercase variants too)
      // This mapping intentionally checks raw e.key values so it works regardless
      // of keyboard layout; if you need localized controls, replace this with
      // a configurable mapping loaded from game settings.
      const map = { ArrowUp: 'North', ArrowDown: 'South', ArrowLeft: 'West', ArrowRight: 'East',
                    w: 'North', s: 'South', a: 'West', d: 'East', W: 'North', S: 'South', A: 'West', D: 'East' };
    const dir = map[e.key];
    if (dir) {
      e.preventDefault();
      onMove(dir);
    }
  });

  // Get item
  document.getElementById('btn-get')?.addEventListener('click', () => {
    const res = getItem(STATE);
    if (!res.ok) {
      pushLog(res.message);
    } else {
      pushLog(`Placed ${res.item} into your backpack.`);
    }
    renderAll();
  });

  // Reset
  document.getElementById('btn-reset')?.addEventListener('click', () => {
    if (confirm('Reset the game? This will clear your progress.')) {
      resetGame(STATE, DATA);
      renderAll();
    }
  });

  // Highlight nearest item(s)
  document.getElementById('btn-highlight')?.addEventListener('click', () => {
    clearPathHighlight();
    const paths = findNearestItemPath(STATE) || [];
    if (!paths || paths.length === 0) {
      pushLog('No nearby items found.');
      return;
    }
    // Highlight all returned paths and show a concise log
    paths.forEach(p => highlightPath(p));
    const targets = paths.map(p => p[p.length - 1]);
    pushLog('Highlighted path(s) to nearest item(s): ' + targets.join(', '));
  });

  // Show immediate neighbors (one-step)
  document.getElementById('btn-neighbors')?.addEventListener('click', () => {
    const nb = findImmediateNeighbors(STATE) || [];
    if (!nb.length) pushLog('No immediate neighbors found.');
    else pushLog('Immediate neighbors: ' + nb.join(', '));
  });

  // Show reachable within N steps (prompt for depth)
  document.getElementById('btn-reachable')?.addEventListener('click', () => {
    let input = prompt('Enter maximum steps (positive integer):', '2');
    if (input === null) return; // cancelled
    const n = parseInt(input, 10);
    if (Number.isNaN(n) || n < 1) { pushLog('Invalid depth. Please enter a positive integer.'); return; }
    const list = findReachableWithin(STATE, n) || [];
    if (!list.length) pushLog(`No rooms within ${n} step(s).`);
    else pushLog(`Reachable within ${n} step(s): ` + list.join(', '));
  });

  // Modal restart
  document.getElementById('modal-restart')?.addEventListener('click', () => {
    hideModal();
    resetGame(STATE, DATA);
    renderAll();
  });
}

/** Handle a move result: render and possibly show endgame modal. */
function onMove(direction) {
  const res = move(STATE, direction);
  if (!res.ok) {
    pushLog(res.message);
  } else if (res.end === 'win') {
    renderAll();
    showModal('You are victorious!', 'With all six items, you fell Darkroot and restore balance to the Whispering Woods.');
  } else if (res.end === 'lose') {
    renderAll();
    showModal('Defeat… for now', 'Darkroot overwhelms you. Return stronger with all six items.');
  } else {
    renderAll();
  }
  announceCurrent();
}

function announceCurrent() {
  const r = DATA.rooms[STATE.current];
  pushLog(`You are in ${r.name}.`);
}

/** Highlight a sequence of rooms on the rendered map. Adds `.path` to each matched cell. */
// Auto-clear timeout id for highlights
let _highlightTimeout = null;
const HIGHLIGHT_TTL_MS = 8000; // default auto-clear after 8s

function _clearHighlightTimer() {
  if (_highlightTimeout) { clearTimeout(_highlightTimeout); _highlightTimeout = null; }
}

function highlightPath(path = []) {
  const mapEl = document.getElementById('map');
  if (!mapEl || !Array.isArray(path) || path.length === 0) return;
  path.forEach((id, idx) => {
    const cell = mapEl.querySelector(`[data-room-id="${CSS.escape(id)}"]`);
    if (!cell) return;
    cell.classList.add('path');
    // If this is the destination cell (last in path), add a small label showing the item name
    if (idx === path.length - 1) {
      // Remove existing label if present
      const existing = cell.querySelector('.path-label');
      if (existing) existing.remove();
      const itemName = (STATE.rooms && STATE.rooms[id] && STATE.rooms[id].item) || (DATA.rooms && DATA.rooms[id] && DATA.rooms[id].item) || '';
      if (itemName) {
        const label = document.createElement('span');
        label.className = 'path-label';
        label.textContent = itemName;
        label.setAttribute('aria-hidden', 'true');
        cell.appendChild(label);
        // Also set a title on the cell for native tooltip
        cell.title = `${DATA.rooms[id]?.name || id} — Item: ${itemName}`;
      }
    }
  });
  // Reset any existing timer and start a new one to auto-clear highlights
  _clearHighlightTimer();
  _highlightTimeout = setTimeout(() => { clearPathHighlight(); pushLog('Path highlights cleared.'); }, HIGHLIGHT_TTL_MS);
}

/** Remove any previously highlighted path cells. */
function clearPathHighlight() {
  const mapEl = document.getElementById('map');
  if (!mapEl) return;
  // Remove path classes and any path-label elements and restore titles
  mapEl.querySelectorAll('.map-cell.path').forEach(el => {
    el.classList.remove('path');
    const lbl = el.querySelector('.path-label'); if (lbl) lbl.remove();
    // restore title to room name if available
    const rid = el.dataset.roomId; if (rid && DATA.rooms && DATA.rooms[rid]) el.title = DATA.rooms[rid].name;
  });
  _clearHighlightTimer();
}

function renderEquip() {
  const grid = document.getElementById('equip');
  if (!grid) return;
  grid.innerHTML = '';
  // For this enhancement, equipment is a graphical view of collected items
  // You could extend this to true equip slots later.
  STATE.inventory.forEach((item) => {
    const card = document.createElement('div');
    card.className = 'icon-card';
    const icon = document.createElement('span');
    icon.className = 'item-icon';
    // Reuse inventory renderer's icons via a small inline map; fall back to a circle
      // If you add a new item type, add its SVG above in this map so the icon shows up.
      icon.innerHTML = { 
      'Silver Axe': '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M3 21l6-6 2 2-6 6H3v-2zM14.7 3.3l6 6-3.4 3.4-6-6L14.7 3.3zm-2.8 4.2l4.6 4.6-6.2 6.2-4.6-4.6 6.2-6.2z"/></svg>',
      'Sunlight Elixir': '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M10 3h4v2h-1v2.1c1.7.5 3 2.1 3 3.9 0 2.2-1.8 4-4 4s-4-1.8-4-4c0-1.8 1.3-3.4 3-3.9V5h-1V3zM6 19c0-2.2 3.6-4 8-4s8 1.8 8 4v2H6v-2z"/></svg>',
      'Ancient Rune': '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2l7 4v12l-7 4-7-4V6l7-4zm0 2.2L7 6.7v10.6l5 2.8 5-2.8V6.7L12 4.2zm-1 3.3h2v9h-2v-9z"/></svg>',
      'Barkskin Potion': '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M9 2h6v2h-1v3.1l3.6 5.8A5 5 0 0 1 12 21a5 5 0 0 1-5.6-8.1L10 7.1V4H9V2z"/></svg>',
      'Druidic Staff': '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a5 5 0 0 1 5 5c0 2.8-2.2 5-5 5-1 0-1.9-.3-2.7-.7l-5.3 9.4-1.7-1 5.2-9.2A5 5 0 0 1 12 2z"/></svg>',
      'Cloak': '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2c2 0 4 1 5 3l3 7-5 10H9L4 12l3-7c1-2 3-3 5-3z"/></svg>',
    }[item] || '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8" fill="currentColor"/></svg>';
    const label = document.createElement('div');
    label.textContent = item;
    label.className = 'item-label';
    card.appendChild(icon);
    card.appendChild(label);
    grid.appendChild(card);
  });
}

init().catch(err => {
  console.error(err);
  alert('Failed to initialize game. See console for details.');
});

/** Show the first-run intro modal unless previously acknowledged. */
function showIntroIfNeeded() {
  // Use a simple localStorage flag separate from save state
  const intro = document.getElementById('intro-modal');
  if (!intro) return;
  const shown = localStorage.getItem('ww:enh1:introShown');
  if (shown) {
    // If the intro has already been acknowledged, ensure the modal is hidden even after navigation/back
    intro.classList.add('hidden');
    return;
  }
  bindIntroButton(intro);
  // Rebind if user switches tabs or navigates back/forward and the page is restored
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      const stillUnack = !localStorage.getItem('ww:enh1:introShown');
      if (stillUnack) bindIntroButton(intro);
      else intro.classList.add('hidden');
    }
  });
}

function bindIntroButton(intro) {
  const btn = document.getElementById('intro-begin');
  if (!btn) return;
  // Remove previous handlers by cloning (ensures clean state if re-binding)
  const cloned = btn.cloneNode(true);
  btn.parentNode.replaceChild(cloned, btn);
  cloned.addEventListener('click', () => dismissIntro(intro));
  cloned.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      dismissIntro(intro);
    }
  });
  cloned.setAttribute('tabindex', '0');
  cloned.focus();
}

function dismissIntro(intro) {
  intro.classList.add('hidden');
  localStorage.setItem('ww:enh1:introShown', '1');
  pushLog('The elders have entrusted you with the quest. Gather all six Items of Power.');
}
