/**
 * Admin panel wiring
 * Verifies session, loads base rooms.json + local overlay, and provides
 * a simple CRUD UI for editing rooms. Changes persist in localStorage.
 */
import { isAuthed, logout } from './auth.js';
import { getOverlay, saveOverlay, listRooms, upsertRoom, deleteRoom, exportOverlay } from './model.js';

let BASE = null;
let OVERLAY = null;
let CURRENT_ID = null;

/** Initialize admin panel: auth check, load data, then render UI. */
async function init() {
  if (!isAuthed()) {
    location.href = './admin-login.html';
    return;
  }
  // Load base data fresh (avoid cache) and current overlay snapshot
  const res = await fetch('./data/rooms.json', { cache: 'no-store' });
  BASE = await res.json();
  OVERLAY = getOverlay();
  renderList();
  hookControls();
}

/** Wire event handlers for admin actions (add/save/delete/export/logout). */
function hookControls() {
  document.getElementById('btn-add-room')?.addEventListener('click', () => {
    CURRENT_ID = null;
    fillForm({ id: '', name: '', desc: '', pos: [0,0], item: '', exits: {} });
  });
  document.getElementById('btn-export')?.addEventListener('click', () => {
    const blob = new Blob([exportOverlay(OVERLAY)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'overlay.json'; a.click();
    // Clean up the one-time object URL
    URL.revokeObjectURL(url);
  });
  document.getElementById('btn-clear')?.addEventListener('click', () => {
    if (confirm('Clear all local admin changes?')) {
      OVERLAY = { rooms: {} };
      saveOverlay(OVERLAY);
      renderList();
      clearForm();
    }
  });
  document.getElementById('btn-logout')?.addEventListener('click', () => {
    logout();
    location.href = './admin-login.html';
  });

  document.getElementById('room-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = readForm();
    if (!data.id) return;
    CURRENT_ID = data.id;
    upsertRoom(OVERLAY, data.id, toPatch(data));
    saveOverlay(OVERLAY);
    renderList();
    inform('Saved. Changes will apply in-game on next load/reset.');
  });

  document.getElementById('btn-delete')?.addEventListener('click', () => {
    if (CURRENT_ID && confirm('Delete this room change from overlay?')) {
      deleteRoom(OVERLAY, CURRENT_ID);
      saveOverlay(OVERLAY);
      renderList();
      clearForm();
    }
  });
}

/** Render list of rooms (base+overlay) with buttons to edit. */
function renderList() {
  const list = document.getElementById('rooms-list');
  list.innerHTML = '';
  const rooms = listRooms(BASE, OVERLAY);
  rooms.forEach(({ id, room }) => {
    const div = document.createElement('div');
    div.className = 'inventory';
    const btn = document.createElement('button');
    btn.className = 'btn';
    btn.textContent = `${id} - ${room?.name ?? ''}`;
    btn.addEventListener('click', () => {
      CURRENT_ID = id;
      fillForm({
        id,
        name: room?.name ?? '',
        desc: room?.desc ?? '',
        pos: room?.pos ?? [0,0],
        item: room?.item ?? '',
        exits: room?.exits ?? {},
      });
    });
    div.appendChild(btn);
    list.appendChild(div);
  });
}

/** Populate the form with a room record. */
function fillForm(r) {
  setVal('room-id', r.id);
  setVal('room-name', r.name);
  setVal('room-desc', r.desc);
  setVal('room-item', r.item || '');
  setVal('room-x', r.pos?.[0] ?? 0);
  setVal('room-y', r.pos?.[1] ?? 0);
  setVal('exit-n', r.exits?.North || '');
  setVal('exit-s', r.exits?.South || '');
  setVal('exit-e', r.exits?.East || '');
  setVal('exit-w', r.exits?.West || '');
  inform('');
}

/** Reset the form to an empty room template. */
function clearForm() {
  fillForm({ id: '', name: '', desc: '', pos: [0,0], item: '', exits: {} });
}

/**
 * Read and coerce form values into a room object.
 * @returns {{ id:string, name:string, desc:string, item:string|null, pos:[number,number], exits:Record<string,string> }}
 */
function readForm() {
  return {
    id: val('room-id').trim(),
    name: val('room-name').trim(),
    desc: val('room-desc').trim(),
    item: (val('room-item').trim() || null),
    pos: [Number(val('room-x') || 0), Number(val('room-y') || 0)],
    exits: {
      ...(val('exit-n').trim() ? { North: val('exit-n').trim() } : {}),
      ...(val('exit-s').trim() ? { South: val('exit-s').trim() } : {}),
      ...(val('exit-e').trim() ? { East: val('exit-e').trim() } : {}),
      ...(val('exit-w').trim() ? { West: val('exit-w').trim() } : {}),
    },
  };
}

// Developer notes:
// - readForm coerces types: pos values are Numbers and exits are a simple map.
// - The admin UI treats room id as the unique key. If you allow renaming ids you
//   should implement a migrate/rename operation to update any edges that point
//   to the old id. Currently, changing the id creates a new overlay entry.
// - toPatch creates a shallow patch object. state.js merges exits specially so
//   admins can add a single new exit without copying the entire exit table.

/**
 * Produce a minimal patch payload from the full form data.
 * @param {{ name:string, desc:string, pos:[number,number], item:string|null, exits:Record<string,string> }} data
 * @returns {object}
 */
function toPatch(data) {
  return {
    name: data.name,
    desc: data.desc,
    pos: data.pos,
    item: data.item,
    exits: data.exits,
  };
}

/** Set input value if element exists. */
function setVal(id, value) {
  const el = document.getElementById(id);
  if (el) el.value = value;
}
/** Get input value (string) or empty if missing. */
function val(id) {
  const el = document.getElementById(id);
  return el ? el.value : '';
}
/** Show a transient info message under the form. */
function inform(msg) {
  const el = document.getElementById('admin-msg');
  if (el) el.textContent = msg;
}

init();
