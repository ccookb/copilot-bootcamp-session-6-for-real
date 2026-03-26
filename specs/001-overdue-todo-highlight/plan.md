# Implementation Plan: Support for Overdue Todo Items

**Branch**: `001-overdue-todo-highlight` | **Date**: 2026-03-25 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-overdue-todo-highlight/spec.md`

## Summary

Add client-side overdue highlighting to `TodoCard`: a danger-coloured left border, a visible "Overdue" badge, and danger-coloured due-date text — all derived at render time from the existing `dueDate` and `completed` fields. Overdue is defined as `dueDate < today (local) && !completed`. The state auto-refreshes via a `setInterval` in `TodoCard` so items transition to overdue without a page reload when midnight passes. No backend or data model changes are required.

## Technical Context

**Language/Version**: JavaScript (ES2020+); React 18.2; Node.js ≥ 16  
**Primary Dependencies**: React 18.2, react-scripts 5.0.1 (CRA), Jest + @testing-library/react 14, jest-dom 5  
**Storage**: N/A — overdue state is a client-side derived computation; no API or data model changes  
**Testing**: Jest + @testing-library/react 14 + @testing-library/jest-dom 5; `jest.useFakeTimers()` for interval testing  
**Target Platform**: Web browser — desktop-focused; max content width 600px  
**Project Type**: Web application — React frontend (`packages/frontend/`) + Express backend (`packages/backend/`)  
**Performance Goals**: N/A — pure render change; zero additional network traffic  
**Constraints**: No new runtime dependencies; ESLint zero errors; ≥80% code coverage maintained; CSS design tokens only (no ad-hoc colour values)  
**Scale/Scope**: Single-user; small todo list (tens of items)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Verify each principle against the planned feature. Mark ✅ Pass, ❌ Fail, or ⚠️ Risk.

| # | Principle | Status | Notes |
|---|-----------|--------|-------|
| I | **Simplicity First** — Single responsibility; no YAGNI violations; no premature optimisation | ✅ | `isOverdue` is a single inline derived boolean inside `TodoCard`. `useEffect`/`setInterval` is the same pattern already used in `App.js`. No new abstractions, utilities, or hooks created. |
| II | **Test-First Development** — Tests written before/with implementation; ≥80% coverage planned; tests isolated and mocked | ✅ | 7 new unit test cases map directly to FR-001–FR-008 acceptance scenarios. `jest.useFakeTimers()` mocks the interval. Tests co-located in `packages/frontend/src/components/__tests__/`. |
| III | **Consistent Code Standards** — 2-space indent; naming conventions; ≤100 char lines; ESLint passes; no duplication | ✅ | CSS uses existing `--danger-color` token. Helper function `isOverdue` follows camelCase. No duplication; logic lives in one place (`TodoCard.js`). |
| IV | **User-Centered Design** — Design system followed; light+dark mode supported; destructive actions confirmed; desktop-focused | ✅ | Uses `--danger-color` token (`#c62828` light / `#ef5350` dark) — automatically correct in both themes. "Overdue" badge provides accessible non-colour cue. |
| V | **Defined Feature Scope** — All changes traceable to docs/functional-requirements.md; no out-of-scope features; backend persistence used | ⚠️ | Overdue highlighting is not listed in `docs/functional-requirements.md` (not in-scope or out-of-scope). **Required action**: update `docs/functional-requirements.md` as part of this feature before merge to maintain traceability. No other out-of-scope items are introduced. |

> ❌ on any principle MUST be resolved before implementation begins.
> Document any necessary violations in the Complexity Tracking table below.

**Constitution Check result**: PASS with one required action — update `docs/functional-requirements.md` to add overdue-highlighting display requirement before merge.

## Project Structure

### Documentation (this feature)

```text
specs/001-overdue-todo-highlight/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
packages/
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── TodoCard.js               ← MODIFY: add isOverdue logic, badge, CSS class
│       │   └── __tests__/
│       │       └── TodoCard.test.js      ← MODIFY: add overdue unit tests
│       ├── App.css                       ← MODIFY: add .todo-card--overdue and .todo-due-date--overdue styles
│       └── styles/
│           └── theme.css                 ← READ ONLY: --danger-color tokens already defined
└── backend/
    └── (no changes required)

docs/
└── functional-requirements.md           ← MODIFY: add overdue display requirement for traceability (Constitution V)
```

**Structure Decision**: Web application (frontend + backend). Only `packages/frontend/` is touched. All overdue state is derived client-side at render time in `TodoCard.js`; no routing, service, or API changes needed.

## Complexity Tracking

> **No Constitution violations requiring justification.** The ⚠️ on Principle V is a traceability action item (update docs), not a complexity violation.
