# Quickstart: Support for Overdue Todo Items

**Branch**: `001-overdue-todo-highlight`  
**Date**: 2026-03-25

## What This Feature Does

Overdue todo items — those with a due date strictly before today and still incomplete — are now visually highlighted in the todo list. Users see:

1. A **danger-coloured left border** on the todo card.
2. An **"Overdue" badge** rendered next to the due date (accessible, non-colour cue).
3. The **due date text** styled in the danger colour.

Today's todos are **not** considered overdue. Completed todos are **never** highlighted regardless of date. The overdue state recalculates automatically (once per minute) — no page refresh required.

---

## Files Changed

| File | Change |
|------|--------|
| `packages/frontend/src/components/TodoCard.js` | Add `now` state, `computeIsOverdue` helper, overdue CSS classes, "Overdue" badge |
| `packages/frontend/src/App.css` | Add `.todo-card--overdue` and `.todo-due-date--overdue` styles |
| `packages/frontend/src/components/__tests__/TodoCard.test.js` | Add overdue unit tests (7 new cases) |
| `docs/functional-requirements.md` | Add overdue display requirement for Constitution V traceability |

No backend files are changed.

---

## Development Setup

```bash
# From repo root — start both frontend and backend
npm run start

# Run all tests with coverage
npm test

# Lint check
npm run lint
```

Frontend runs on http://localhost:3000, backend on http://localhost:3030.

---

## Key Implementation Details

### `computeIsOverdue` helper (in `TodoCard.js`)

```js
function computeIsOverdue(dueDate, completed, now) {
  if (!dueDate || completed) return false;
  const todayMidnight = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );
  return new Date(dueDate + 'T00:00:00') < todayMidnight;
}
```

**Why `+ 'T00:00:00'`**: ISO date-only strings (`"2026-03-20"`) are parsed as UTC midnight by the JS spec, which shifts the apparent day for users in UTC-negative timezones. Appending `T00:00:00` (no timezone offset) forces local midnight parsing, matching the user's calendar.

### Midnight auto-refresh (in `TodoCard.js`)

```js
const [now, setNow] = useState(new Date());

useEffect(() => {
  const timer = setInterval(() => setNow(new Date()), 60_000);
  return () => clearInterval(timer);
}, []);
```

Fires every 60 seconds; cleans up on unmount. Satisfies FR-008.

### CSS (in `App.css`)

```css
.todo-card--overdue {
  border-left: 4px solid var(--danger-color);
}

.todo-due-date--overdue {
  color: var(--danger-color);
}

.overdue-badge {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--danger-color);
  margin-left: var(--space-xs);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
```

`--danger-color` is already defined in `theme.css` as `#c62828` (light) / `#ef5350` (dark).

---

## Test Checklist

All new test cases target `packages/frontend/src/components/__tests__/TodoCard.test.js`:

- [ ] Overdue incomplete todo — shows `.todo-card--overdue` class
- [ ] Overdue incomplete todo — renders "Overdue" badge
- [ ] Overdue incomplete todo — due date has `.todo-due-date--overdue` class
- [ ] Completed todo with past date — no overdue indicator
- [ ] Todo due today — no overdue indicator
- [ ] Todo with no due date — no overdue indicator
- [ ] After marking overdue todo complete — overdue indicator disappears

---

## Acceptance Check

| FR | Test | Manual Verification |
|----|------|---------------------|
| FR-001 | overdue card CSS class | Create todo with yesterday's date, leave incomplete — left border appears |
| FR-002 | rendered without interaction | No hover/click needed |
| FR-003 | completed todo test | Mark an overdue todo complete — border disappears |
| FR-004 | no-due-date test | Create todo without due date — no border |
| FR-005 | CSS token + badge test | Verify colour in both light and dark mode |
| FR-006 | toggle test | Toggle complete on overdue todo — indicator goes away immediately |
| FR-007 | due-date text class test | Due date text renders in danger colour |
| FR-008 | fake timer interval test | Advance timer 60 s — `now` state updates, overdue re-evaluated |
