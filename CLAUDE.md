# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running the project

Open `tictactoe.html` directly in a browser — no build step, no server needed:

```bash
open tictactoe.html
```

## Architecture

Single-file vanilla web app (`tictactoe.html`). All CSS, HTML, and JS live in one file with no external dependencies or frameworks.

**JS state model** (bottom of the file, inside `<script>`):
- `board` — flat 9-element array (`''`, `'X'`, or `'O'`), indexed 0–8 left-to-right, top-to-bottom
- `current` — whose turn it is (`'X'` or `'O'`)
- `over` — boolean, blocks clicks after win/tie
- `scores` — `{ X, O, tie }` object, persists across `init()` calls but resets on page reload (in-memory only)
- `WINS` — hardcoded array of the 8 winning index triplets

**Key functions:**
- `init()` — resets board/state, leaves scores untouched
- `checkWin()` — iterates `WINS`, returns winning triplet or `null`
- Cell click handler — updates state, calls `checkWin()`, updates DOM

**JS/CSS bridge — dynamic classes added to `.cell` elements:**
- `taken` — added on any click; prevents re-clicking (`:not(.taken)` hover rule)
- `x` / `o` — sets player text color via `.cell.x` / `.cell.o` rules
- `win` — highlights winning cells and triggers the pulse animation

**DOM element IDs the JS references:** `board`, `status`, `reset`, `score-x`, `score-o`, `score-tie`

**CSS theme:** dark navy (`#1a1a2e`, `#16213e`, `#0f3460`) with red (`#e94560`) for X and teal (`#a8dadc`) for O.

## Projects

### `tictactoe.html`
Standalone Tic Tac Toe game — open directly in a browser, no server needed.

### `cleaning-scheduler/`
Scheduling app for a cleaning business. Connects to Google Calendar via OAuth to show upcoming jobs and book new appointments with availability checking.

- `index.html` — the entire app (HTML + CSS + JS, no build step)
- `SETUP.md` — one-time Google Cloud + GitHub Pages setup instructions

**One-time config:** paste a Google OAuth Client ID into the `CLIENT_ID` constant near the top of `index.html` before the app will authenticate. See `SETUP.md` for full steps.

**How it works:** Reads and writes events to the user's primary Google Calendar. Events are titled `Cleaning – [Client Name]` so they can be filtered on the dashboard. Availability is determined by querying the `freeBusy` API for a given date + duration and slotting candidates in 30-minute increments between 8 AM and 6 PM.

**Auth / persistent login:** Uses Google Identity Services token client. The access token + expiry are persisted to `localStorage` under `cs_token`; on boot a still-valid token restores the session with no prompt, an expired one triggers a silent `requestAccessToken({prompt:''})` refresh, and `callApi` retries once via silent refresh on a 401. `signOut` clears `cs_token` so the next visit waits for an explicit sign-in.

**UI:** Editorial-light theme (off-white canvas, indigo `#4f46e5` accent, Fraunces display + Inter UI). Wide layout (`max-width:1280px`): a stat hero (`#stats-hero` via `renderStats()`) above a `.cal-layout` grid = calendar `.cal-main` + sticky `.cal-rail` (selected-day detail + `#rail-upcoming`); collapses to one column ≤980px. Feedback via non-blocking toasts (`showToast`) and a promise-based `confirmDialog` (`#confirm-modal`) — no native `alert`/`confirm`. Booked jobs can be **canceled** (DELETE) or **rescheduled** (PATCH, booking form reused via `rescheduleId`); inquiries **edited** (`editingId`, which also dedupes respond-from-modal) or **deleted**.

**Calendar views:** `calView` (`month|week|day|agenda`) + `viewDate` drive rendering; a view switcher + `‹ › Today` + the month/year dropdowns navigate. `loadCalendar()` fetches the active view's range (`viewRange()`) and dispatches to `renderCalendar` (month grid), `renderTimeGrid('week'|'day')` (hour grid, `HOUR_PX`), or `renderAgenda` (grouped list; also used for client **search** via the Calendar API `q` param). A separate `loadUpcoming()` keeps a stable now→+60d `upcomingEvents` set powering stats + rail (independent of the active view). Jobs are **color-coded by service** (`serviceOf()` → `SERVICE_COLORS`; standard=indigo, deep=teal, moveout=amber, custom=slate); the legend chips double as a **filter** (`activeServices`). **Keyboard shortcuts** (`onShortcut`): ←/→ navigate, T today, N new, M/W/D/A views, Esc.

## Git workflow

Commit and push after every meaningful unit of work — don't batch unrelated changes or leave work uncommitted. This ensures progress is never lost and the GitHub history reflects the current state of the project.

```bash
git add <files>
git commit -m "<type>: <description>"
git push
```

Commit types: `feat:`, `fix:`, `style:`, `refactor:`

Good commit messages are concise and describe *what changed and why*, not just "update file". Example: `feat: add score reset button to clear session totals`.

Remote: `https://github.com/IridescentOnyx/ClaudeCodeTest` (private)
