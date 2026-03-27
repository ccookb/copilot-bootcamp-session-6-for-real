# Tasks: Project Organisation for Todos

**Branch**: `002-todo-projects` | **Date**: 2026-03-26  
**Input**: Design documents from `/specs/002-todo-projects/`  
**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | contracts/api.md ✅ | quickstart.md ✅

**Organization**: Tasks are grouped by user story. Each phase is independently testable and deployable.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no unmet dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Exact file paths are included in every implementation task

---

## Phase 1: Setup

**Purpose**: Add project colour tokens to the design system — required by all phases.

- [X] T001 Add 8 project colour token pairs to `:root` in `packages/frontend/src/styles/theme.css` (`--project-color-<name>` and `--project-color-<name>-text` for blue, green, red, yellow, purple, orange, teal, pink)

---

## Phase 2: Foundational (Backend — blocks all user stories)

**Purpose**: Database schema changes and the `/api/projects` REST resource. Must be complete before any frontend work begins.

**⚠️ CRITICAL**: All user story implementation depends on this phase being complete.

- [X] T002 Enable FK enforcement and recreate DB schema in `packages/backend/src/app.js`: add `db.pragma('foreign_keys = ON')` immediately after `new Database(':memory:')`, then rewrite `db.exec()` to create `projects` table first, then `todos` table with `projectId INTEGER REFERENCES projects(id) ON DELETE SET NULL`
- [X] T003 Create `packages/backend/src/services/projectService.js` — `ProjectService` class with methods: `getAllProjects()`, `getProjectById(id)`, `createProject(title, colour)`, `updateProject(id, updates)`, `deleteProject(id)`; include `ALLOWED_COLOURS` constant and all validation logic (title required/max 100 chars/unique case-insensitive, colour from allowed list)
- [X] T004 Register `GET /api/projects` route in `packages/backend/src/app.js` (inline handler, consistent with existing todo routes)
- [X] T005 Register `POST /api/projects` route in `packages/backend/src/app.js` with 400/409 error handling per contracts/api.md
- [X] T006 Register `PUT /api/projects/:id` route in `packages/backend/src/app.js` with 400/404/409 error handling per contracts/api.md
- [X] T007 Register `DELETE /api/projects/:id` route in `packages/backend/src/app.js` — nullifies todos before deleting project (redundant with ON DELETE SET NULL, but explicit per research.md R-004); returns 400/404 per contracts/api.md
- [X] T008 Update `POST /api/todos` in `packages/backend/src/app.js` to accept optional `projectId` in request body and persist it to the DB
- [X] T009 Update `PUT /api/todos/:id` in `packages/backend/src/app.js` to accept optional `projectId` (including explicit `null` to remove the association)
- [X] T010 Extend `packages/backend/__tests__/app.test.js` with integration tests for all 4 `/api/projects` endpoints (GET list, POST create with 400/409 cases, PUT update with 400/404/409 cases, DELETE with 404 and todo-unassign verification) and for the updated projectId handling in `/api/todos`

**Checkpoint**: Backend is complete. `npm test` in `packages/backend` passes. All `/api/projects` routes respond correctly. Todos include `projectId` field.

---

## Phase 3: User Story 1 — Create and Manage Projects (Priority: P1) 🎯 MVP

**Goal**: Users can navigate to a "Projects" view, create projects with a title and colour, edit them, and delete them with a confirmation dialog. Projects persist across page reloads.

**Independent Test**: Open the app. Click the "Projects" nav tab. Create a project titled "Work" with colour "blue". Verify it appears in the project list. Edit it to rename it "Personal" with colour "green". Verify the change. Delete it — confirm the dialog appears, confirm deletion, verify it is gone. Reload the page and verify the empty state.

### Implementation for User Story 1

- [X] T011 [US1] Create `packages/frontend/src/services/projectService.js` — `ProjectService` static class with methods: `getAllProjects()`, `createProject(title, colour)`, `updateProject(id, { title, colour })`, `deleteProject(id)`; mirrors `todoService.js` pattern using `fetch` and `API_BASE_URL = '/api'`
- [X] T012 [P] [US1] Create `packages/frontend/src/services/__tests__/projectService.test.js` — unit tests for all 4 `ProjectService` methods; mock `global.fetch`; test happy paths and error propagation
- [X] T013 [US1] Create `packages/frontend/src/components/ProjectsPanel.js` — full projects management view: displays project list (title, colour swatch, Edit button, Delete button), includes inline create form (title text input + colour swatch picker of 8 swatches), includes inline edit form (same fields, pre-populated), reuses `ConfirmDialog` for delete with message "Deleting this project will remove it from all associated todos."; accepts `onProjectsChange` callback prop; manages its own loading/error state
- [X] T014 [P] [US1] Create `packages/frontend/src/components/__tests__/ProjectsPanel.test.js` — tests: renders empty state, renders project list, create form validates empty title, create form submits and calls `ProjectService.createProject`, edit form pre-populates and submits `ProjectService.updateProject`, delete shows `ConfirmDialog` and calls `ProjectService.deleteProject` on confirm; mock `ProjectService`
- [X] T015 [US1] Update `packages/frontend/src/App.js` — add `const [currentView, setCurrentView] = useState('todos')` and `const [projects, setProjects] = useState([])` state; fetch projects on mount alongside `fetchTodos()`; add `handleProjectsChange` callback that re-fetches projects; pass `projects` to `ProjectsPanel`; add nav tab buttons ("Todos" / "Projects") to the header; conditionally render `ProjectsPanel` or the todo view based on `currentView`
- [X] T016 [P] [US1] Update `packages/frontend/src/App.css` — add nav tab button styles (active/inactive states, consistent with existing design system; use `--primary` token for active tab)

**Checkpoint**: User Story 1 is independently functional. Navigate to "Projects" tab, create/edit/delete projects, reload the page — all works without touching todos.

---

## Phase 4: User Story 2 — Assign a Project to a Todo (Priority: P2)

**Goal**: Users can optionally assign a project to a todo when creating or editing it. The todo card displays a coloured pill badge for the assigned project. The pill disappears when the assignment is removed.

**Independent Test**: With at least one project created, create a new todo and assign it to the project. Verify the coloured pill badge with the project name appears below the todo title. Edit the todo and change the project. Verify the pill updates. Edit again and remove the project — verify no pill is shown.

### Implementation for User Story 2

- [X] T017 [US2] Update `packages/frontend/src/App.js` — pass `projects` and `selectedProjectId` as props to `TodoForm`; update `handleCreateTodo` to accept and forward `projectId`; update `handleEditTodo` to accept and forward `projectId`; pass resolved `project` object (looked up from `projects` array by `todo.projectId`) as a prop to each `TodoCard`
- [X] T018 [US2] Update `packages/frontend/src/components/TodoForm.js` — add `projects` and `defaultProjectId` props; add a `<select>` dropdown for optional project assignment (first option: "No project", then one `<option>` per project); pre-select `defaultProjectId` when provided; include `projectId` in the `onSubmit` call
- [X] T019 [US2] Update `packages/frontend/src/components/TodoCard.js` — accept `project` prop (resolved Project object or null); render project pill `<span className="project-pill">` with project name when `project` is non-null, styled via `style={{ backgroundColor: \`var(--project-color-${project.colour})\`, color: \`var(--project-color-${project.colour}-text)\` }}`; pass `projectId` through the edit submit handler; add `.project-pill` CSS in `App.css` (pill shape: `border-radius: 12px`, `padding: 2px 8px`, `font-size: 12px`)
- [X] T020 [P] [US2] Update `packages/frontend/src/components/__tests__/TodoCard.test.js` — add tests: renders project pill when `project` prop is provided with correct name and colour style; does NOT render pill when `project` prop is null/undefined; edit form includes project dropdown when `projects` prop supplied; edit submit includes `projectId`
- [X] T021 [P] [US2] Update `packages/frontend/src/components/__tests__/TodoForm.test.js` — add tests: renders project selector when `projects` prop is non-empty; "No project" option present; pre-selects `defaultProjectId`; `onSubmit` called with correct `projectId` value

**Checkpoint**: User Stories 1 and 2 both work independently. Todos show/hide project pills correctly. Creating and editing todos with project assignment works end-to-end.

---

## Phase 5: User Story 3 — Filter Todos by Project (Priority: P3)

**Goal**: A horizontal row of project filter chips above the todo list lets users show only todos for a selected project. The "All" chip clears the filter. When a filter is active and a new todo is created, the form pre-selects the active project.

**Independent Test**: With todos assigned to at least two different projects, click a project chip — only matching todos are shown. Click "All" — all todos reappear. With a project filter active, open the create form — the active project is pre-selected.

### Implementation for User Story 3

- [X] T022 [US3] Create `packages/frontend/src/components/ProjectFilterBar.js` — renders "All" chip + one chip per project; highlights the active chip; accepts `projects`, `selectedProjectId`, and `onSelectProject` props; calls `onSelectProject(null)` for "All" and `onSelectProject(project.id)` for project chips; only renders when `projects.length > 0`
- [X] T023 [P] [US3] Create `packages/frontend/src/components/__tests__/ProjectFilterBar.test.js` — tests: renders "All" chip; renders one chip per project; "All" chip has active style when `selectedProjectId` is null; project chip has active style when its id matches `selectedProjectId`; clicking a project chip calls `onSelectProject` with correct id; clicking "All" calls `onSelectProject(null)`
- [X] T024 [US3] Update `packages/frontend/src/App.js` — add `const [selectedProjectId, setSelectedProjectId] = useState(null)`; add `const displayedTodos = useMemo(() => selectedProjectId ? todos.filter(t => t.projectId === selectedProjectId) : todos, [todos, selectedProjectId])`; render `<ProjectFilterBar>` above the todo list in the todos view; pass `selectedProjectId` as `defaultProjectId` to `TodoForm` so the active filter project is pre-selected on new todo creation; pass `displayedTodos` (not `todos`) to `TodoList`
- [X] T025 [P] [US3] Update `packages/frontend/src/__tests__/App.test.js` — add tests: filter bar renders when projects exist; clicking a project chip filters the todo list; clicking "All" chip unfilters; creating a todo with active filter pre-selects the project in the form; empty state shown when filter matches no todos

**Checkpoint**: All 3 user stories fully functional. Filter works instantly with no page reload. Pre-selection works on create form.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Functional requirements documentation update and final validation.

- [X] T026 Update `docs/functional-requirements.md` — add a "Projects" section documenting: project entity (title, colour), project management view, project assignment on todos, pill badge display, filter chip bar; update "No Advanced Features" or "Out of Scope" lists to reflect that project filtering is now in scope
- [X] T027 Verify full test suite passes with ≥ 80% coverage: run `npm test` from repo root; fix any coverage gaps in new files (`projectService.js` backend/frontend, `ProjectsPanel.js`, `ProjectFilterBar.js`)

---

## Dependencies

```
Phase 1 (CSS tokens)
  └─ Unblocks: T019 (TodoCard pill styling), T022 (ProjectFilterBar chip colours)

Phase 2 (Backend)
  └─ Unblocks: Phase 3, Phase 4, Phase 5 (all frontend work requires API)

Phase 3 US1 (ProjectsPanel + App.js nav)
  └─ Unblocks: Phase 4 (needs projects in App state + projects fetched)
  └─ Unblocks: Phase 5 (needs selectedProjectId state in App)

Phase 4 US2 (Todo assignment + pill)
  └─ Unblocks: Phase 5 (needs projectId on todos and pill on cards to verify filter)

Phase 5 US3 (Filter bar)
  └─ No further dependencies; final feature increment
```

**Parallel execution within phases**: Tasks marked `[P]` can be executed simultaneously within their phase (they target different files).

---

## Parallel Execution Examples

**Phase 2** (after T002 is merged, T003–T009 can proceed in parallel if working on distinct files):
- T003 (projectService.js) can be written alongside T004–T009 (app.js routes); T010 (tests) can begin once T003–T009 are drafted.

**Phase 3** (after T015 App.js is drafted):
- T012 (projectService tests), T014 (ProjectsPanel tests), T016 (CSS) are all independent and can be worked simultaneously.

**Phase 4** (after T017 App.js is updated):
- T020 (TodoCard tests) and T021 (TodoForm tests) are independent and can run in parallel.

**Phase 5**:
- T023 (ProjectFilterBar tests) can be written alongside T024 (App.js update).

---

## Implementation Strategy

**MVP**: Complete Phase 1 + Phase 2 + Phase 3 (US1). This delivers a working projects management view with persistence — independently demonstrable and testable.

**Increment 2**: Add Phase 4 (US2) — connects projects to todos via pill badges and assignment forms.

**Increment 3**: Add Phase 5 (US3) — adds the filter chip bar for focused viewing.

**Final**: Phase 6 polish — documentation update and coverage gate.

---

## Task Summary

| Phase | Tasks | User Story | Parallelizable |
|-------|-------|------------|----------------|
| 1 — Setup | T001 | — | — |
| 2 — Foundational (Backend) | T002–T010 | — | T003–T009 after T002 |
| 3 — US1: Create & Manage Projects | T011–T016 | US1 (P1) | T012, T014, T016 |
| 4 — US2: Assign Project to Todo | T017–T021 | US2 (P2) | T020, T021 |
| 5 — US3: Filter Todos by Project | T022–T025 | US3 (P3) | T023, T025 |
| 6 — Polish | T026–T027 | — | — |
| **Total** | **27 tasks** | **3 user stories** | **9 parallelizable** |
