# Tasks: Support for Overdue Todo Items

**Input**: Design documents from `/specs/001-overdue-todo-highlight/`  
**Branch**: `001-overdue-todo-highlight`  
**Date**: 2026-03-25

> Tests are included: Constitution Principle II mandates test-first development (NON-NEGOTIABLE).

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (US1, US2)
- Exact file paths are included in all task descriptions

---

## Phase 1: Setup

**Purpose**: Update project documentation to satisfy Constitution Principle V traceability gate before any implementation begins.

- [ ] T001 Update `docs/functional-requirements.md` to add overdue display requirement under section 1.2 (View Todos) — required for Constitution V gate: all changes must be traceable to this document

**Checkpoint**: Constitution V gate satisfied — implementation may now begin.

---

## Phase 2: User Story 1 - Visual Overdue Indicator (Priority: P1) 🎯 MVP

**Goal**: Incomplete todo cards whose `dueDate` is strictly before today display a danger-coloured left border, an "Overdue" badge, and the badge is accessible to screen readers and colour-blind users.

**Independent Test**: Create a todo with a due date of yesterday, leave it incomplete → left border and "Overdue" badge appear. Mark it complete → both disappear immediately. Create a todo with today's date → no indicator. Create a todo with no due date → no indicator.

### Tests for User Story 1 ⚠️

> **Write these tests FIRST — ensure they FAIL before starting implementation (T008–T010)**

- [ ] T002 [P] [US1] Add test: overdue incomplete todo has `.todo-card--overdue` class in `packages/frontend/src/components/__tests__/TodoCard.test.js` — mock `Date` to a fixed "today"; pass a `dueDate` of yesterday
- [ ] T003 [P] [US1] Add test: overdue incomplete todo renders "Overdue" badge text in `packages/frontend/src/components/__tests__/TodoCard.test.js`
- [ ] T004 [P] [US1] Add test: completed todo with past due date does NOT have `.todo-card--overdue` class in `packages/frontend/src/components/__tests__/TodoCard.test.js`
- [ ] T005 [P] [US1] Add test: todo with `dueDate` equal to today does NOT have `.todo-card--overdue` class in `packages/frontend/src/components/__tests__/TodoCard.test.js`
- [ ] T006 [P] [US1] Add test: todo with no due date does NOT have `.todo-card--overdue` class in `packages/frontend/src/components/__tests__/TodoCard.test.js`
- [ ] T007 [US1] Add test: overdue indicator disappears when todo is toggled to complete — use `fireEvent.click` on checkbox and assert class is removed in `packages/frontend/src/components/__tests__/TodoCard.test.js`

### Implementation for User Story 1

- [ ] T008 [US1] Add `computeIsOverdue(dueDate, completed, now)` helper function and `now` state + 60-second `setInterval` auto-refresh in `packages/frontend/src/components/TodoCard.js` (see research.md D1, D2 for exact implementation patterns)
- [ ] T009 [US1] Apply `.todo-card--overdue` CSS class to the card root `<div>` and render `<span className="overdue-badge">Overdue</span>` inside `.todo-content` when `isOverdue` is true in `packages/frontend/src/components/TodoCard.js`
- [ ] T010 [US1] Add `.todo-card--overdue` (danger left border) and `.overdue-badge` (danger colour, small caps) CSS rules using `var(--danger-color)` token in `packages/frontend/src/App.css`

**Checkpoint**: User Story 1 fully functional — left border and "Overdue" badge visible; tests pass.

---

## Phase 3: User Story 2 - Overdue Due Date Text Styling (Priority: P2)

**Goal**: When a todo is overdue, the due date text (`"Due: Jan 1, 2026"`) is also rendered in the danger colour, reinforcing urgency beyond the badge alone.

**Independent Test**: Create an overdue incomplete todo with a past due date → "Due: [date]" text renders in red/danger colour. Mark it complete → date text returns to normal secondary colour.

> **Note**: US2 depends on US1 being complete (reuses `isOverdue` boolean and `now` state from TodoCard.js). Verify US1 tests pass before starting T011.

### Tests for User Story 2 ⚠️

> **Write these tests FIRST — ensure they FAIL before starting implementation (T013–T014)**

- [ ] T011 [P] [US2] Add test: overdue incomplete todo's due date element has `.todo-due-date--overdue` class in `packages/frontend/src/components/__tests__/TodoCard.test.js`
- [ ] T012 [P] [US2] Add test: completed todo with past due date does NOT have `.todo-due-date--overdue` class on due date element in `packages/frontend/src/components/__tests__/TodoCard.test.js`

### Implementation for User Story 2

- [ ] T013 [US2] Apply `.todo-due-date--overdue` CSS class to the `.todo-due-date` `<p>` element when `isOverdue` is true in `packages/frontend/src/components/TodoCard.js`
- [ ] T014 [US2] Add `.todo-due-date--overdue { color: var(--danger-color); }` CSS rule to `packages/frontend/src/App.css`

**Checkpoint**: User Stories 1 AND 2 both complete — all visual overdue indicators (border, badge, date text) functional in both light and dark modes.

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: Auto-refresh behaviour, lint gate, and final validation.

- [ ] T015 [P] Add timer auto-refresh test: use `jest.useFakeTimers()` + `jest.setSystemTime()` to assert `now` state updates after `jest.advanceTimersByTime(60_000)` causes a re-render with updated overdue status in `packages/frontend/src/components/__tests__/TodoCard.test.js`
- [ ] T016 Verify ESLint passes with zero errors: `npm run lint` from `packages/frontend/` — resolve any warnings before opening a PR

**Checkpoint**: All tests pass, coverage ≥80%, lint clean — ready for PR.

---

## Dependencies

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Phase 1 (Setup/T001). No dependency on US2.
- **User Story 2 (P2)**: Can start after US1 implementation (T008) is complete, as it reuses `isOverdue` from `TodoCard.js`. Tests (T011–T012) can be written in parallel with US1 implementation.

### Within Each User Story

- All `[P]`-marked test tasks (T002–T006, T011–T012) MUST be written and FAIL before their corresponding implementation tasks
- T008 (core `isOverdue` logic) must complete before T009 (JSX application)
- T009 (JSX classes) must complete before T010 (CSS rules) — logical only; files differ so they could technically be parallel but inline order prevents confusion
- T013 depends on T008 (reuses `isOverdue`)
- T014 can be done in parallel with T013

---

## Parallel Opportunities

### User Story 1 — write all 6 test stubs together

```
T002: test .todo-card--overdue class presence
T003: test "Overdue" badge text
T004: test completed todo — no indicator
T005: test due-today — no indicator
T006: test no-due-date — no indicator
T007: test toggle-complete removes indicator
```

### User Story 2 — write both test stubs together

```
T011: test .todo-due-date--overdue class presence
T012: test completed — no overdue date class
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: T001 — update docs
2. Complete US1 tests (T002–T007) — ensure they FAIL
3. Complete US1 implementation (T008–T010) — tests turn GREEN
4. **STOP and VALIDATE**: Left border + badge working; tests pass
5. Demo / checkpoint

### Incremental Delivery

1. T001 (traceability) → US1 tests → US1 impl → ✅ MVP
2. US2 tests → US2 impl → ✅ Full feature
3. T015–T016 polish → PR ready

---

## Notes

- `[P]` test tasks within a story can all be written in one session as stubs, then verified to fail before writing any implementation
- `computeIsOverdue` and `now`/`setInterval` live entirely inside `TodoCard.js` — no new files, no new hooks, no prop threading
- CSS uses only the existing `--danger-color` token — no new design tokens introduced
- No backend files are touched; all changes are in `packages/frontend/` plus `docs/`
- Total: **16 tasks** across 4 phases
