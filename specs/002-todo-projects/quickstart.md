# Quickstart: Project Organisation for Todos

**Branch**: `002-todo-projects` | **Date**: 2026-03-26  
**Spec**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md) | **Data model**: [data-model.md](data-model.md) | **API contract**: [contracts/api.md](contracts/api.md)

This guide gives an implementer everything needed to begin work immediately.

---

## 1. Prerequisites

- Node.js v16+ and npm v7+ installed
- Repository cloned, dependencies installed (`npm install` from repo root)
- Existing tests passing: `npm test` from repo root (both packages)
- Current branch: `002-todo-projects` (or create it: `git checkout -b 002-todo-projects`)

```bash
cd /path/to/repo
npm install
npm test   # must all pass before you start
```

---

## 2. Delivery Order (P1 → P2 → P3)

Follow this order. Each milestone is independently testable.

| # | Milestone | Spec Priority | Key deliverables |
|---|-----------|---------------|-----------------|
| 1 | Backend: projects table + API | P1 foundation | `projectService.js`, new routes in `app.js`, backend tests |
| 2 | Frontend: Projects management view | P1 UI | `ProjectsPanel.js`, `projectService.js` (frontend), nav tab in `App.js` |
| 3 | Frontend: Assign project to todo | P2 | `TodoForm.js` (add project selector), `TodoCard.js` (add pill badge), update `App.js` create/edit handlers |
| 4 | Frontend: Project filter bar | P3 | `ProjectFilterBar.js`, derived filter state in `App.js` |
| 5 | Update functional requirements doc | — | `docs/functional-requirements.md` — add projects feature section |

---

## 3. Backend Changes

### 3a. `packages/backend/src/app.js`

**Step 1** — Enable FK enforcement immediately after opening the DB:
```js
const db = new Database(':memory:');
db.pragma('foreign_keys = ON');   // ADD THIS LINE
```

**Step 2** — Replace the `db.exec(...)` block. Create `projects` first, then `todos` with the new `projectId` FK column:
```sql
CREATE TABLE IF NOT EXISTS projects (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  title     TEXT    NOT NULL,
  colour    TEXT    NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS todos (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  title     TEXT    NOT NULL,
  dueDate   TEXT,
  completed BOOLEAN DEFAULT 0,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  projectId INTEGER REFERENCES projects(id) ON DELETE SET NULL
);
```

**Step 3** — Register `/api/projects` routes (GET list, POST create, PUT update, DELETE delete) inline in `app.js`, following the same pattern as `/api/todos` routes.

**Step 4** — Update `POST /api/todos` and `PUT /api/todos/:id` to accept optional `projectId` in the request body and persist it.

### 3b. `packages/backend/src/services/projectService.js` (new file)

Mirror the `TodoService` class pattern. Methods needed:
- `getAllProjects()` — `SELECT * FROM projects ORDER BY createdAt ASC`
- `createProject(title, colour)` — validate title (required, ≤100 chars), validate colour (one of 8 values), check uniqueness case-insensitively, insert.
- `updateProject(id, { title, colour })` — validate same rules, check uniqueness excluding self, update.
- `deleteProject(id)` — find project, nullify todos (`UPDATE todos SET projectId = NULL WHERE projectId = ?`), delete project row.

**Allowed colour values constant** (define once, reuse in validation):
```js
const ALLOWED_COLOURS = ['blue', 'green', 'red', 'yellow', 'purple', 'orange', 'teal', 'pink'];
```

---

## 4. Frontend Changes

### 4a. `packages/frontend/src/styles/theme.css`

Add the following 8 colour token pairs to the existing `:root` block (do **not** add them to `[data-theme="dark"]` — these are identity colours, not semantic surface colours):

```css
--project-color-blue:    #2563eb;  --project-color-blue-text:    #ffffff;
--project-color-green:   #16a34a;  --project-color-green-text:   #ffffff;
--project-color-red:     #dc2626;  --project-color-red-text:     #ffffff;
--project-color-yellow:  #ca8a04;  --project-color-yellow-text:  #ffffff;
--project-color-purple:  #7c3aed;  --project-color-purple-text:  #ffffff;
--project-color-orange:  #ea580c;  --project-color-orange-text:  #ffffff;
--project-color-teal:    #0d9488;  --project-color-teal-text:    #ffffff;
--project-color-pink:    #db2777;  --project-color-pink-text:    #ffffff;
```

Apply in JSX: `style={{ backgroundColor: \`var(--project-color-${project.colour})\`, color: \`var(--project-color-${project.colour}-text)\` }}`

### 4b. `packages/frontend/src/services/projectService.js` (new file)

Mirror `todoService.js` static class pattern. Methods needed:
- `ProjectService.getAllProjects()` — `GET /api/projects`
- `ProjectService.createProject(title, colour)` — `POST /api/projects`
- `ProjectService.updateProject(id, { title, colour })` — `PUT /api/projects/${id}`
- `ProjectService.deleteProject(id)` — `DELETE /api/projects/${id}`

### 4c. `packages/frontend/src/App.js`

New state to add:
```js
const [currentView, setCurrentView] = useState('todos');  // 'todos' | 'projects'
const [projects, setProjects] = useState([]);
const [selectedProjectId, setSelectedProjectId] = useState(null);
```

Derived state (in render, before return):
```js
const displayedTodos = useMemo(
  () => selectedProjectId ? todos.filter(t => t.projectId === selectedProjectId) : todos,
  [todos, selectedProjectId]
);
```

Fetch projects on mount (alongside `fetchTodos()`). Pass `projects` and `selectedProjectId` as props to `TodoForm`, `TodoList`/`TodoCard`, and `ProjectFilterBar`. Render nav tabs in the header.

### 4d. New components

**`ProjectsPanel.js`** — manages the projects list view:
- Displays list of projects (title, colour swatch, edit button, delete button)
- Inline or modal form for create/edit (title text input + colour swatch picker)
- Delete triggers `ConfirmDialog` (reuse existing component) with a warning about todo unassignment
- Owns its own local state; calls `ProjectService` methods directly; notifies `App.js` via `onProjectsChange` callback

**`ProjectFilterBar.js`** — horizontal filter chip row:
- Renders "All" chip + one chip per project
- Active chip highlighted (use `btn-secondary` or dedicated `chip--active` class)
- `onSelectProject(projectId | null)` callback prop
- Displayed above `TodoList` only when on the todos view and at least one project exists

### 4e. Modified components

**`TodoCard.js`** — after the todo title, render the project pill when `todo.projectId` is set:
```jsx
{assignedProject && (
  <span
    className="project-pill"
    style={{
      backgroundColor: `var(--project-color-${assignedProject.colour})`,
      color: `var(--project-color-${assignedProject.colour}-text)`,
    }}
  >
    {assignedProject.title}
  </span>
)}
```
`assignedProject` is resolved by the parent passing a `project` prop, or TodoCard can look it up from a `projects` prop array.

**`TodoForm.js`** — add a `<select>` for optional project assignment:
```jsx
<select value={projectId} onChange={e => setProjectId(e.target.value || null)}>
  <option value="">No project</option>
  {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
</select>
```
Accepts `projects` array and optional `defaultProjectId` props.

---

## 5. File Checklist

| File | Action | Spec ref |
|------|--------|----------|
| `packages/backend/src/app.js` | Modify | FR-001–FR-012 |
| `packages/backend/src/services/projectService.js` | Create | FR-001–FR-004, FR-012 |
| `packages/backend/__tests__/app.test.js` | Extend | All FR |
| `packages/frontend/src/styles/theme.css` | Modify | FR-007 |
| `packages/frontend/src/services/projectService.js` | Create | FR-001–FR-004 |
| `packages/frontend/src/services/__tests__/projectService.test.js` | Create | FR-001–FR-004 |
| `packages/frontend/src/App.js` | Modify | FR-005, FR-009–FR-011 |
| `packages/frontend/src/components/ProjectsPanel.js` | Create | FR-001–FR-003, FR-012 |
| `packages/frontend/src/components/ProjectFilterBar.js` | Create | FR-009–FR-011 |
| `packages/frontend/src/components/TodoCard.js` | Modify | FR-007, FR-008 |
| `packages/frontend/src/components/TodoForm.js` | Modify | FR-005, FR-006 |
| `packages/frontend/src/components/__tests__/ProjectsPanel.test.js` | Create | All FR |
| `packages/frontend/src/components/__tests__/ProjectFilterBar.test.js` | Create | FR-009–FR-011 |
| `docs/functional-requirements.md` | Modify | Constitution V |

---

## 6. Running the App

```bash
# From repo root — starts both backend (port 3001) and frontend (port 3000)
npm run start
```

The frontend proxies `/api` requests to the backend, so no CORS configuration changes are needed.

---

## 7. Running Tests

```bash
# All tests (from repo root)
npm test

# Backend only
cd packages/backend && npm test

# Frontend only
cd packages/frontend && npm test

# With coverage report
npm test -- --coverage
```

Coverage must remain ≥ 80% across all packages after all changes are merged.
