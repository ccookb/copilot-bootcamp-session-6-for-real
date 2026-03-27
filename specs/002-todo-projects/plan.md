# Implementation Plan: Project Organisation for Todos

**Branch**: `002-todo-projects` | **Date**: 2026-03-26 | **Spec**: [spec.md](spec.md)  
**Input**: Feature specification from `/specs/002-todo-projects/spec.md`

## Summary

Users need a way to create named, colour-coded projects and optionally assign any todo to a project. Assigned todos display a coloured pill badge on their card. The todo list includes a horizontal filter-chip row to show only todos for a selected project. Projects are managed in a dedicated "Projects" view (separate from the todo list) accessible via a navigation tab in the header.

**Technical approach**: Add a `projects` table to the in-memory SQLite database with a nullable FK (`projectId`) on `todos`. Expose a `/api/projects` REST resource (CRUD) mirroring the existing `/api/todos` pattern. In React, add a `ProjectService`, a `ProjectsPanel` component, and a `ProjectFilterBar` component. Filter state is null-or-id derived state in `App.js`. Navigation between the todo view and projects view is a single `currentView` state string in `App.js` — no router added.

## Technical Context

**Language/Version**: JavaScript (Node.js v16+, React 18)  
**Primary Dependencies**: React, Express.js, better-sqlite3, Jest, @testing-library/react  
**Storage**: In-memory SQLite via better-sqlite3 — new `projects` table + `projectId` FK on `todos`  
**Testing**: Jest + @testing-library/react (frontend); Jest (backend); ≥80% coverage required  
**Target Platform**: Desktop browser (Chrome/Firefox/Safari), desktop-focused, max content width 600px  
**Project Type**: Full-stack web application (React SPA + Express API monorepo)  
**Performance Goals**: No hard latency targets for a single-user in-memory app; filter display update must be perceptibly instant (synchronous derived state, no async)  
**Constraints**: No new npm runtime dependencies; no react-router; no migration scripts (in-memory DB recreated on start); all state persisted to backend  
**Scale/Scope**: Single user; small project count (tens); existing codebase patterns must be preserved

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| # | Principle | Status | Notes |
|---|-----------|--------|-------|
| I | **Simplicity First** — Single responsibility; no YAGNI violations; no premature optimisation | ✅ | No router, no state library, no extra abstractions. `ProjectService` mirrors `TodoService` pattern. Filter is derived state. |
| II | **Test-First Development** — Tests written before/with implementation; ≥80% coverage planned; tests isolated and mocked | ✅ | Unit tests planned for `ProjectService` (backend), `projectService` (frontend), `ProjectsPanel`, `ProjectFilterBar`, `TodoCard` (project pill). All API calls mocked. |
| III | **Consistent Code Standards** — 2-space indent; naming conventions; ≤100 char lines; ESLint passes; no duplication | ✅ | All new code follows existing conventions. Colour tokens use `--project-color-<name>` pattern. |
| IV | **User-Centered Design** — Design system followed; light+dark mode supported; destructive actions confirmed; desktop-focused | ✅ | Colour tokens defined in `:root` (invariant across themes). Delete confirmation dialog required for projects (FR-003). Pill uses design-system token pair for contrast. |
| V | **Defined Feature Scope** — All changes traceable to docs/functional-requirements.md; no out-of-scope features; backend persistence used | ⚠️ | `docs/functional-requirements.md` does not yet include projects. **Required action**: update `functional-requirements.md` as part of implementation to add the projects feature. All implementation is traceable to the spec (FR-001 – FR-012). |

> ⚠️ on Principle V: `docs/functional-requirements.md` must be updated to include the projects feature before the PR is merged. This is an expected part of delivering this feature, not a violation.

## Project Structure

### Documentation (this feature)

```text
specs/002-todo-projects/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── api.md           # REST API contract for /api/projects
└── tasks.md             # Phase 2 output (/speckit.tasks — not created by /speckit.plan)
```

### Source Code (repository root)

```text
packages/backend/
├── src/
│   ├── app.js                        # Add PRAGMA FK + projects table + /api/projects routes
│   └── services/
│       └── projectService.js         # NEW — mirrors todoService.js pattern
└── __tests__/
    └── app.test.js                   # Extend with /api/projects integration tests

packages/frontend/
├── src/
│   ├── App.js                        # Add currentView state, projects state, selectedProjectId state
│   ├── App.css                       # Minor layout additions (nav tabs)
│   ├── components/
│   │   ├── ProjectsPanel.js          # NEW — project management view (list, create, edit, delete)
│   │   ├── ProjectFilterBar.js       # NEW — horizontal project filter chip row
│   │   ├── TodoCard.js               # MODIFY — render project pill badge
│   │   └── TodoForm.js               # MODIFY — add optional project selector
│   ├── components/__tests__/
│   │   ├── ProjectsPanel.test.js     # NEW
│   │   └── ProjectFilterBar.test.js  # NEW
│   └── services/
│       ├── projectService.js         # NEW — mirrors todoService.js pattern
│       └── __tests__/
│           └── projectService.test.js # NEW
└── src/styles/
    └── theme.css                     # Add --project-color-<name> token pairs
```

**Structure Decision**: Web application (backend + frontend monorepo). New files mirror the established service/component/test pattern exactly. No new directories are required.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|--------------------------------------|
| `docs/functional-requirements.md` update required (Principle V risk) | This file documents the canonical feature set; the projects feature is new capability not yet listed. | Skipping the update would leave the requirements doc out of sync with the codebase, violating the traceability principle on future PRs. |
