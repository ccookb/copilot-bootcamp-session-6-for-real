# Data Model: Support for Overdue Todo Items

**Phase**: 1 — Design  
**Branch**: `001-overdue-todo-highlight`  
**Date**: 2026-03-25

## Overview

No data model changes are required for this feature. Overdue status is a **derived, display-time computation** based on two existing fields of the `Todo` entity. There are no new backend fields, API endpoints, or database schema changes.

---

## Existing Entity: Todo Item

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | integer | ✅ | Auto-incremented primary key |
| `title` | string (max 255) | ✅ | Todo title |
| `dueDate` | ISO date string (`YYYY-MM-DD`) or `null` | ❌ | Optional due date |
| `completed` | boolean / 0 or 1 (SQLite integer) | ✅ | Completion status |
| `createdAt` | ISO datetime string | ✅ | Auto-set at creation |

---

## Derived Computation: `isOverdue`

`isOverdue` is **not stored**. It is computed at render time inside `TodoCard.js`.

### Definition

```
isOverdue(todo, now) =
  todo.dueDate !== null
  AND todo.completed == false (0)
  AND localDate(todo.dueDate) < localDate(now)
```

### JavaScript implementation

```js
function computeIsOverdue(dueDate, completed, now) {
  if (!dueDate || completed) return false;
  const todayMidnight = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );
  const due = new Date(dueDate + 'T00:00:00'); // local midnight
  return due < todayMidnight;
}
```

### State Transitions

```
Todo state          → isOverdue?
─────────────────────────────────
no dueDate          → false  (FR-004)
dueDate = today     → false  (spec edge case: today is NOT overdue)
dueDate < today, incomplete → true   (FR-001)
dueDate < today, completed  → false  (FR-003)
```

---

## UI State Model: TodoCard

`TodoCard` manages the following local state relevant to this feature:

| State variable | Type | Purpose |
|----------------|------|---------|
| `now` | `Date` | Current local date; updated every 60 s by `setInterval` (FR-008) |

`isOverdue` is derived from `now`, `todo.dueDate`, and `todo.completed` at each render. No other state is added.

---

## CSS Class Model

Two new modifier classes are added to `App.css`:

| Class | Applied to | Trigger |
|-------|-----------|---------|
| `.todo-card--overdue` | `.todo-card` root div | `isOverdue === true` |
| `.todo-due-date--overdue` | `.todo-due-date` paragraph | `isOverdue === true` |

These classes use the existing `--danger-color` CSS custom property, which resolves automatically in light and dark modes.

---

## No API / Backend Changes

- No new REST endpoints.
- No changes to `packages/backend/src/services/todoService.js` or `packages/backend/src/app.js`.
- The backend continues to return `dueDate` as an ISO date string and `completed` as `0` or `1`; the frontend already handles both.
