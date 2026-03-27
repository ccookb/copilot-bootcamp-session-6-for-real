# Research: Project Organisation for Todos

**Branch**: `002-todo-projects` | **Date**: 2026-03-26

All unknowns identified during Technical Context analysis have been resolved below.

---

## R-001 — SQLite FK Pattern (better-sqlite3, nullable FK, cascade behaviour)

**Decision**: Add `projectId INTEGER REFERENCES projects(id) ON DELETE SET NULL` to the `todos` table definition in `db.exec()`. Create the `projects` table first (dependency order). Enable FK enforcement with `PRAGMA foreign_keys = ON` immediately after opening the database.

**Rationale**:
- SQLite's `ALTER TABLE` does not support adding FK-constrained columns. Since the database is `:memory:` and is recreated on every process start, there is no migration burden — rewrite the `db.exec()` initialisation block to define `projects` before `todos`.
- `ON DELETE SET NULL` is the correct semantic: FR-003 requires deleting a project to unassign todos, not delete them. `ON DELETE CASCADE` would delete the todos, violating the requirement.
- `PRAGMA foreign_keys = ON` must be issued per-connection in SQLite; better-sqlite3 does not enable FK enforcement by default.
- The `projectId` column is nullable (`INTEGER`, no `NOT NULL`) correctly modelling the optional association.

**Alternatives Considered**:
- `ALTER TABLE ADD COLUMN projectId INTEGER REFERENCES ...` — not valid in SQLite; FK constraints cannot be added via ALTER. Rejected.
- `ON DELETE CASCADE` — would delete todos when their project is deleted; violates FR-003. Rejected.
- No FK, enforce in application layer — loses DB-level referential integrity, increases surface for orphaned references. Rejected.

---

## R-002 — React State Management for Project Filter

**Decision**: Store the selected filter as `const [selectedProjectId, setSelectedProjectId] = useState(null)` in `App.js`. Compute the displayed list as **derived state in render**: `const displayedTodos = selectedProjectId ? todos.filter(t => t.projectId === selectedProjectId) : todos`. Wrap in `useMemo` for readability.

**Rationale**:
- `App.js` already holds `todos` as the single source of truth. A separate `filteredTodos` state would duplicate data and require synchronisation on every create/update/delete, which is a known source of bugs.
- Derived state computed in render is always consistent at zero extra cost. With typical todo list sizes (tens of items), `useMemo` is optional but clarifies intent.
- A single `null | number` value is the simplest representation: `null` = "All projects", any number = active filter.
- The edge case ("pre-select the active project when creating a todo while a filter is active") is handled by passing `selectedProjectId` as a default prop into `TodoForm` — no additional state complexity.

**Alternatives Considered**:
- Store `filteredTodos` in state alongside `todos` — requires manual synchronisation on every mutation. Rejected.
- `useReducer` combining filter + todos — adds indirection for a single scalar value. Viable if the app grows; overkill now. Rejected.
- React Context or Zustand — overkill for a filter shared between two siblings in the same component tree. Rejected.

---

## R-003 — CSS Colour Token Pattern

**Decision**: Define 8 static project colour tokens in the existing `:root` block in `theme.css`. Each colour has a paired `-text` token for contrast. Tokens are **not** overridden in `[data-theme="dark"]` — project colours are identity colours, invariant across themes.

```css
/* Added to :root in packages/frontend/src/styles/theme.css */
--project-color-blue:    #2563eb;  --project-color-blue-text:    #ffffff;
--project-color-green:   #16a34a;  --project-color-green-text:   #ffffff;
--project-color-red:     #dc2626;  --project-color-red-text:     #ffffff;
--project-color-yellow:  #ca8a04;  --project-color-yellow-text:  #ffffff;
--project-color-purple:  #7c3aed;  --project-color-purple-text:  #ffffff;
--project-color-orange:  #ea580c;  --project-color-orange-text:  #ffffff;
--project-color-teal:    #0d9488;  --project-color-teal-text:    #ffffff;
--project-color-pink:    #db2777;  --project-color-pink-text:    #ffffff;
```

Apply dynamically via inline style: `style={{ backgroundColor: \`var(--project-color-${project.colour})\`, color: \`var(--project-color-${project.colour}-text)\` }}`.

**Rationale**:
- Project colours are brand/identity colours — a "blue" project should look blue in both light and dark mode. Defining them once in `:root` keeps the theme file simple and avoids 8 redundant dark-mode overrides.
- The chosen hues (Tailwind 600-level equivalents) have sufficient contrast against white text (≥4.5:1) per WCAG AA at normal text sizes across both light and dark UI backgrounds.
- Pairing a `-text` token with each colour avoids hardcoding `color: white` in component CSS, enabling future adjustment (e.g. yellow → dark text) without touching component files.

**Alternatives Considered**:
- Override colours in `[data-theme="dark"]` with lighter variants — adds 8 unnecessary overrides for colours that are already readable. Rejected.
- Store hex values in JS constants and apply only as inline styles — bypasses the established CSS variable system, makes design-time theming harder. Rejected.

---

## R-004 — Express Resource Pattern for `/api/projects`

**Decision**: Add a `ProjectService` class in `packages/backend/src/services/projectService.js` (mirroring `TodoService`). Register routes inline in `app.js` consistent with existing todo routes. Required endpoints: `GET /api/projects`, `POST /api/projects`, `PUT /api/projects/:id`, `DELETE /api/projects/:id`.

**Rationale**:
- The existing `app.js` registers all todo routes as inline `app.get/post/put/patch/delete` calls. Introducing an Express `Router` only for projects would be inconsistent with the established pattern.
- `ProjectService` keeps DB access and validation logic out of route handlers, mirroring the `todoService.js` class structure that is already unit-tested.
- `PUT /api/projects/:id` is required by FR-012 (edit project title and colour). Unlike the research Q4 initial assessment, the spec explicitly includes this capability.
- `DELETE /api/projects/:id` must issue `UPDATE todos SET projectId = NULL WHERE projectId = ?` before deleting the project row, since `ON DELETE SET NULL` requires FK enforcement to be active.

**Alternatives Considered**:
- `express.Router()` in a separate file — good practice for larger apps but inconsistent with the established inline pattern at this scope. Would require also refactoring todos for consistency. Rejected.
- Enforce SET NULL in application service rather than relying on SQLite FK — explicitly done in `ProjectService.deleteProject()` for clarity, regardless of FK enforcement, as a double-safety measure.

---

## R-005 — React Navigation Pattern (no router)

**Decision**: Add `const [currentView, setCurrentView] = useState('todos')` in `App.js`. Render either the todo view or a `ProjectsPanel` full-page component based on this state. Add navigation tab buttons (e.g. "Todos" / "Projects") to the existing header.

**Rationale**:
- The existing layout is a single-column `flex-direction: column` app with a sticky header. Adding a second view behind a navigation tab is the least invasive structural change: no layout refactor, no new dependencies, no shared state complexity.
- `ProjectsPanel` owns its own local state (project list, create form, edit form, delete confirm dialog). The only state shared with `App.js` is the `projects` array (needed by `TodoForm` and `ProjectFilterBar`) and `selectedProjectId`.
- This pattern matches the spec requirement that project management feels like a dedicated management screen, not a persistent sidebar.

**Alternatives Considered**:
- Persistent left sidebar — requires a two-column layout, responsive breakpoints, significant CSS changes; spec describes a management panel, not a persistent sidebar. Rejected.
- Modal/drawer — mixes modality; project management is a first-class surface. Rejected.
- `react-router-dom` — adds a dependency; the rest of the app does not use URL-based navigation. Rejected (constitution constraint: no new dependencies).
- Projects section below the todo list on one page — creates scroll UX issues and conflates two distinct concerns. Rejected.
