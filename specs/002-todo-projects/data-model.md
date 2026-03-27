# Data Model: Project Organisation for Todos

**Branch**: `002-todo-projects` | **Date**: 2026-03-26

---

## Entities

### Project (new entity)

Represents an organisational grouping that todos can optionally belong to.

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | Auto-assigned |
| `title` | TEXT | NOT NULL, UNIQUE (case-insensitive), max 100 chars | Uniqueness enforced at service layer |
| `colour` | TEXT | NOT NULL, one of the 8 allowed values | Validated at service layer |
| `createdAt` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Set automatically on insert |

**Allowed `colour` values** (exactly 8): `blue`, `green`, `red`, `yellow`, `purple`, `orange`, `teal`, `pink`

**Validation rules**:
- `title` must be a non-empty string after trimming, max 100 characters.
- `title` must be unique across all projects, case-insensitive (`LOWER(title)` comparison in service).
- `colour` must be one of the 8 allowed string values.

**State transitions**: No lifecycle states — a project exists or is deleted.

---

### Todo (extended — adds `projectId` FK)

The existing todo entity gains one new optional field.

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | Existing |
| `title` | TEXT | NOT NULL, max 255 chars | Existing |
| `dueDate` | TEXT | NULLABLE | Existing; ISO date string |
| `completed` | BOOLEAN | DEFAULT 0 | Existing |
| `createdAt` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Existing |
| `projectId` | INTEGER | NULLABLE, FK → projects(id) ON DELETE SET NULL | **NEW** |

**FK behaviour**: When a project is deleted, all todos with that `projectId` have the field set to `NULL` — the todos are not deleted. `PRAGMA foreign_keys = ON` must be active for the ON DELETE SET NULL to fire automatically; `ProjectService.deleteProject()` also explicitly nullifies as a redundancy.

---

## Schema (SQLite DDL)

```sql
PRAGMA foreign_keys = ON;

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

**Initialisation order**: `projects` table must be created before `todos` (FK dependency).  
**PRAGMA placement**: `PRAGMA foreign_keys = ON` must be the first statement executed after opening the database connection.

---

## Relationships

```
Project (0 or 1) ←────── Todo (many)
                 projectId FK (nullable)
```

- A project has **zero or many** todos.
- A todo belongs to **zero or one** project.
- Deleting a project → todos lose their `projectId` (set to `NULL`) but are not deleted.
- Deleting a todo → no effect on the project.

---

## Frontend Data Shape

Todos returned by `GET /api/todos` will now include `projectId`:

```json
{
  "id": 1,
  "title": "Write unit tests",
  "dueDate": "2026-04-01",
  "completed": 0,
  "createdAt": "2026-03-26T10:00:00.000Z",
  "projectId": 3
}
```

Projects returned by `GET /api/projects`:

```json
{
  "id": 3,
  "title": "Work",
  "colour": "blue",
  "createdAt": "2026-03-26T09:00:00.000Z"
}
```

The frontend resolves the project display by looking up `todo.projectId` in the `projects` array held in `App.js` state.

---

## No Derived Persistence

Overdue status (feature 001) and project filter state are purely client-side, runtime derivations — neither is stored in the database.
