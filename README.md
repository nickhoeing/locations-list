# Hide Locations Prototypes

Interactive mobile UI prototypes for **hiding locations and subsites** on the Collect Locations list. Three independent phone frames demonstrate different interaction models.

## Options

1. **Option A — Selection + filter sheet**  
   Checklist icon or long-press for select. Filter icon + chip for Unhidden / Hidden / All. **⋮** opens a bottom sheet (Hide/Unhide, Select). Directions stay on the row.

2. **Option B — Visibility chips + swipe**  
   Segmented **Unhidden | Hidden | All** under the tabs. Swipe left on a row or location header to hide/unhide. Checklist icon for bulk actions.

3. **Option C — Bottom sheet with Get directions**  
   **⋮** opens a bottom sheet with Hide/Unhide and **Get directions** (directions icon removed from the row). Filter modal for Visibility. Checklist icon for bulk.

## Shared behavior

- Hide applies to **parent locations** and **individual subsites**
- Effective hidden = location hidden OR subsite hidden
- Default visibility filter is **Unhidden** (hidden items leave ALL / DOWNLOADED)
- Hidden rows show an eye-slash icon (and a Hidden label when viewing All)
- Each phone keeps its own in-memory state

## Run

```bash
npm install
npm run dev
```

Open the local URL Vite prints (usually `http://localhost:5173`).

## Stack

- React 19 + TypeScript
- Vite
- Plain CSS (no component library)

## Key files

- `src/App.tsx` — page layout with three phones
- `src/OptionA.tsx` / `OptionB.tsx` / `OptionC.tsx` — interactive prototypes
- `src/LocationsShared.tsx` — shared list chrome, rows, swipe, bulk bar
- `src/data.ts` — Location/Subsite model and visibility helpers
- `src/App.css` — styles matched to the Locations screenshot
