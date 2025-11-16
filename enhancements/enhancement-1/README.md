# Whispering-Woods
CS-499 Computer Science Capstone 2025

## Author

- Name: Duane Wegner
- Role: Author / Developer
- Affiliation: Southern New Hampshire University - CS-499 Computer Science Capstone
- Contact: <duane.wegner@gmail.com>

Short bio: I am a computer science student focusing on full-stack development and interactive web applications. This enhancement converts a Python text-based adventure into a modular, static web app suitable for GitHub Pages and portfolio presentation.

## Overview

Whispering Woods is a browser-hosted enhancement of an original Python text-based adventure. This enhancement converts the original artifact into a static, GitHub Pages–friendly application implemented using HTML, CSS, and vanilla JavaScript. All game state is persisted locally (localStorage) and the admin overlay is local-only for easy editing during development.

---

## Table of contents

- [Enhancements](#enhancements)
  - Enhancement 1 - Web-based Conversion
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

## Screenshots

### Admin Login<br>
A lightweight local-only login screen used to protect the admin overlay.<br>
<img src="images/admin-login.png" width="500" height="250">

### Admin Panel<br>
Tools for editing rooms, items, exits, and map metadata during development.<br>
<img src="images/admin-panel.png" width="500">

### Home Page<br>
Landing page that leads into the main game.<br>
<img src="images/home.png" width="500">

### Game Play<br>
Main interface showing the fog-of-war map, inventory, movement controls, and event log.<br>
<img src="images/game.png" width="500">

# Developer notes

- Save keys: namespaced, e.g., `ww:enh1:save:v1` (see `js/storage.js`).
- Admin overlay: stored in localStorage under `admin:overlay:v1`; overlay entries are shallow-merged on top of `data/rooms.json` at runtime. Deleting an overlay record currently reverts to base data. If you want true removals, adopt a `removed: true` convention and handle it in the merge logic.
- Accessibility: the alerts region uses `aria-live`; modals are simple and a focus trap is not yet implemented, add one if you make interactive dialogs.


## How to run (developer)

1. Open `enhancements/enhancement-1/index.html` in a browser (double-click or use a local static server).
2. For editing the base rooms, modify `data/rooms.json`.
3. For local admin edits, open `admin-login.html` and create/login with a local password. Admin edits are stored in localStorage and apply at runtime when the game is loaded.


## License & contact

Copyright © 2025 Duane Wegner.

All rights reserved. This repository is provided for viewing and evaluation only. No permission is granted to use, copy, modify, or distribute without written consent. [Email Me](mailto:duane.wegner@gmail.com)