# Whispering-Woods
CS-499 Computer Science Capstone 2025

## Author

- Name: Duane Wegner
- Role: Author / Developer
- Affiliation: Southern New Hampshire University - CS-499 Computer Science Capstone
- Contact: <duane.wegner@gmail.com>

Short bio: I am a computer science student focusing on full-stack development and interactive web applications. This enhancement converts a Python text-based adventure into a modular, static web app suitable for GitHub Pages and portfolio presentation.

## Overview

Whispering Woods is a browser-hosted enhancement of an [original Python text-based adventure](../../Artifact%20File/Whispering-Woods.py). This enhancement converts the original artifact into a static, GitHub Pages–friendly application implemented using HTML, CSS, and vanilla JavaScript. All game state is persisted locally (localStorage) and the admin overlay is local-only for easy editing during development.

---

## Table of contents

- [Enhancements](#enhancements)
  - Enhancement 1 - Web-based Conversion
  - Enhancement 2 - Algorithms & Data Structures
  - Enhancement 3 - Databases
- [Screenshots](#screenshots)
- [How to run](#how-to-run-developer) (developer)
- [Developer notes](#developer-notes)
- [License & contact](#license--contact)

---

## Enhancements

    ### Enhancement 1 - Web-based Conversion (enhancement-1)

    Summary

    - Converts the original Python text adventure into a playable browser game.
    - Implemented using static HTML, CSS, and ES modules (no external libraries) so it can be hosted on GitHub Pages.
    - Uses localStorage for player save state and a separate local overlay for admin edits.

    Key features

    - Fog-of-war map that reveals rooms as the player explores.
    - Keyboard controls (arrow keys and WASD) and clickable buttons.
    - Inventory system with icons and progress badge.
    - Admin overlay UI (local-only) to add or tweak rooms, items, and exits; overlay merges at runtime.
    - Intro and endgame modals.

    Project structure

    - `index.html` - Landing page and entry to the game.
    - `game.html` - Main gameplay page (map, controls, inventory, log, modals).
    - `admin.html` - Main administrator page (edits rooms, add rooms)
    - `css/styles.css` - Theme, layout, and map cell styles.
    - `data/rooms.json` - Base room graph and items.
    - `js/` - ES module code (storage, state, game rules, UI renderers, admin tools).

    How to play

    1. Open `index.html` (or host the folder on GitHub Pages and visit the published URL).
    2. Click Start Game.
    3. Use arrow keys or WASD to move; or click direction buttons.
    4. Click Get Item when an item is present in the room; collected items persist locally.
    5. Enter Shadow Hollow with all six key items to win the game.
    6. Use Reset Game to clear the current run.

  <br>

    ### Enhancement 2 - Algorithms & Data Structures (enhancements-2)

    Summary

    - Adds Category Two work: graph algorithms and data-structure improvements to support efficient map exploration, pathfinding, and inventory-aware queries.
    - Implements BFS shortest-path, BFS nearest-item (ignores items already owned), and reachable-set traversal. Adds unit tests and a small UI control to highlight paths on the map.

    Key features (Enhancement 2)

    - `js/algorithms.js` — BFS-based helpers: `bfsPath`, `bfsNearestWithItem`, and `reachableRooms` (with Big-O comments).
    - `js/game.js` (modified) — exposes `findNearestItemPath` (now respects player's inventory) and `findPath` helpers.
    - `js/main.js` (modified) — adds a "Highlight Nearest" button that visualizes the nearest acquirable item on the map.
    - `js/algorithms-test.html` and `js/algorithms-unit-test.html` — simple browser pages to run example queries and unit tests for the algorithms.
    - `css/styles.css` — added path highlight styles.

    How Enhancement 2 improves the project

    - Demonstrates O(V+E) BFS traversal for pathfinding (scales to larger maps without changing algorithmic logic).
    - Inventory-aware nearest-item search prevents recommending rooms whose items the player already collected.
    - Adds testability with a unit-test HTML page and a visual demo (highlighting) for quicker instructor validation.

  How to run Enhancement 2 (developer)

  1. From the repository root, start a simple static server in the enhancement-2 folder:

  ```bash
  cd "enhancements/enhancements-2"
  python3 -m http.server 8000
  ```

  2. Open the game page in your browser:

  - http://localhost:8000/game.html

  3. Try the new highlight feature:

  - Click "Highlight Nearest" in the Actions panel to visualize the shortest path to the nearest item you can still collect (rooms with already-collected items are ignored).

  4. Run algorithm tests:

  - Unit tests: http://localhost:8000/js/algorithms-unit-test.html
  - Example queries/test page: http://localhost:8000/js/algorithms-test.html

  Notes

  - All enhancement work in this folder is additive and does not modify the original `Artifact File/Whispering-Woods.py`.
  - The BFS nearest-item helper accepts an optional `ownedItems` list or Set so it can be reused elsewhere (e.g., AI recommendations) while remaining backwards-compatible.

  ## Enhancement 2 — Evidence & Course Outcomes

    - Purpose: Implement algorithmic support for the game so players and developers can query the room graph efficiently (shortest path, nearest acquirable item, reachable sets) and validate behavior with repeatable tests.

  ### Importing overlay changes (admin)

    - You can now import a previously exported overlay JSON file directly from the Admin UI.
    - Steps:
      1. Open `admin.html` and log in with your admin password.
      2. Click the **Import Changes** button and choose your `overlay.json` file (the file should contain a top-level `rooms` object matching the overlay shape).
      3. On successful import the overlay is saved to localStorage and the admin UI will refresh to show the imported entries. The game page will pick up changes on next load or you can reload it manually.
    - Notes: The importer performs a basic validation (top-level `rooms` object). If you need stricter schema validation (pos arrays, exit maps, etc.), I can add deeper checks before saving.

    - How this maps to course outcomes:
      - **Outcome 2 (Professional communication):** Achieved — algorithm functions and unit tests are documented and included as self-contained pages that reviewers can run in a browser.
      - **Outcome 3 (Design & evaluate computing solutions):** Achieved and extended — BFS-based solutions (O(V+E) complexity) demonstrate applied algorithmic design and evaluation; tests validate correctness on small graphs and edge cases.
      - **Outcome 4 (Techniques, skills, tools):** Achieved — use of modular ES modules, small test harness pages, and integration with the UI demonstrates practical engineering practices.
      - **Outcome 5 (Security mindset):** Unchanged by Enhancement 2 — admin auth and persistence remain client-only; security notes remain documented in developer notes.

  ## Files added / modified in Enhancement 2

    - `js/algorithms.js` — BFS helpers and traversal utilities (primary algorithmic work).
    - `js/algorithms-unit-test.html` — in-browser unit tests validating BFS behavior and edge cases.
    - `js/algorithms-test.html` — small interactive demo for algorithm queries (example/diagnostics).
    - `js/main.js` — wiring for UI controls that highlight nearest-item paths and expose reachable queries.
    - `js/ui/map.js` & `css/styles.css` — minor updates to support path highlighting and map rendering behaviors.
    - `data/rooms.json` — the data-driven room graph used by the algorithms; remains the authoritative source of room definitions.

  <br>

    ### Enhancement 3 - Local Admin Overlay & UX (enhancement-3)

    Summary

    - Extends the admin overlay workflow with a safer import experience and improved UX while keeping all persistence local to the browser.
    - Adds preview and confirm step for imported overlays, stronger client-side validation, and timestamped export filenames to help trace changes when collaborators share overlay files.

    Key features (Enhancement 3)

    - Admin Import Preview: after selecting a JSON file, the admin UI shows a formatted preview and requires explicit confirmation before applying changes.
    - Stronger Validation: imports are validated for expected shapes (top-level object, `rooms` map, per-room `name`, `desc`, `pos`, `item`, and `exits`). Invalid files are rejected with clear messages.
    - Timestamped Exports: exported overlay files are named like `overlay-YYYYMMDD-HHMMSS.json` to help collaborators identify versions.
    - Local-only Persistence: all changes remain stored in the browser via namespaced keys; no server-side persistence is added in this enhancement.

    Storage and Authentication (local databases)

    - The app uses browser storage as lightweight local databases:
      - `localStorage` holds persistent data across browser sessions for the origin. Keys are namespaced via the storage helper so the effective keys include the namespace prefix. Examples you will see in the code and DevTools include:
        - `ww:enh1:save:v1` — player save slot (full runtime state snapshot).
        - `ww:enh1:admin:overlay:v1` — admin overlay JSON that patches `data/rooms.json` at runtime.
        - `ww:enh1:admin:pwdhash:v1` — SHA-256 hash of the admin password for local-only auth.
      - `sessionStorage` is used for a per-tab admin session flag: `admin:session:v1` (cleared on tab close).

    - Overlay behavior:
      - Overlays mirror the shape of `data/rooms.json` and are merged at runtime by `js/state.js`. Overlays do not change the base JSON file on disk; they only affect the running application in that browser profile.
      - To share overlays between browsers or teammates, use the Admin Export button to download a JSON file and the Admin Import to load it into a different browser or profile.

    - Practical notes:
      - localStorage is per-origin and per-profile; it is not a replacement for a centralized database. Typical browser quotas are around 5MB per origin. Keep overlays small and use export/import for transfer or archival.
      - The stored password hash is readable by anyone with access to the browser profile; the local auth is convenience-only and not a secure authentication mechanism.

## Screenshots

### Admin Login<br>
A lightweight local-only login screen used to protect the admin overlay.<br>
<img src="enhancements\enhancements-2\images/admin-login.png" width="500" height="250">

### Admin Panel<br>
Tools for editing rooms, items, exits, and map metadata during development.<br>
<img src="enhancements\enhancements-2\images/admin-panel.png" width="500">

### Home Page<br>
Landing page that leads into the main game.<br>
<img src="enhancements\enhancements-2\images/home.png" width="500">

### Game Play<br>
Main interface showing the fog-of-war map, inventory, movement controls, and event log.<br>
<img src="enhancements\enhancements-2\images/game.png" width="500">

### Add Room / Export Changes / Import Changes
Admin interface showing the added features and a working test room that has been added.<br>
<img src="enhancements\enhancements-2\images/test-a.png" width="500"> <img src="images/test-a_Room.png" width="500">

### Algorithms Demo
Admin interface showcasing the Algorithms Demo.<br>
<img src="enhancements\enhancements-2\images/AlgoTest.png" width="500">

### Algorithms Unit Tests
Admin interface showcasing the Algorithms Unit Test.<br>
<img src="enhancements\enhancements-2\images/algoUnitTest.png" width="500">


# Developer notes

- Save keys: namespaced, e.g., `ww:enh1:save:v1` (see `js/storage.js`).
- Admin overlay: stored in localStorage under `admin:overlay:v1`; overlay entries are shallow-merged on top of `data/rooms.json` at runtime. Deleting an overlay record currently reverts to base data. If you want true removals, adopt a `removed: true` convention and handle it in the merge logic.
- Accessibility: the alerts region uses `aria-live`; modals are simple and a focus trap is not yet implemented, add one if you make interactive dialogs.


## How to run (developer)

1. Open `enhancement/enhancement-3/index.html` in a browser (double-click or use a local static server).
2. For editing the base rooms, modify `data/rooms.json`.
3. For local admin edits, open `admin-login.html` and create/login with a local password. Admin edits are stored in localStorage and apply at runtime when the game is loaded.


## License & contact

Copyright © 2025 Duane Wegner.


All rights reserved. This repository is provided for viewing and evaluation only. No permission is granted to use, copy, modify, or distribute without written consent. [Email Me](mailto:duane.wegner@gmail.com)
