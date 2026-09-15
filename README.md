# Pludmonitoring

PLUD Leasing Tracker — a leasing pipeline and listings dashboard for PLUD properties.

## Files

- **`PLUDLeasingTracker.html`** — a single-file, plain HTML/CSS/JS build. No build step,
  no dependencies; open it directly in a browser. Easiest to hand-edit.
- **`PLUDLeasingTracker.jsx`** — a React component version of the same app (Tailwind
  classes, lucide-react icons), meant for use inside a React project or as a Claude
  artifact.

## Features

- Sign-in with a name + password (client-side, salted/hashed — not a real backend auth
  system, just a lightweight gate).
- Dashboard with pipeline stats, occupancy rate, stage breakdown, and recent activity.
- Prospective tenants tab: searchable/filterable CRUD table with category → concept and
  property → unit cascading dropdowns.
- PLUD listings tab: grouped by property, with computed status (Available / Active
  Inquiries / Occupied) based on linked tenant records, and editable floor area /
  asking rate with auto-computed monthly rent.
- Left sidebar navigation, pinned to the viewport while content scrolls.
- Data persists via `window.storage` (when running as a Claude artifact) so seed data
  loads once and edits are saved from then on.
