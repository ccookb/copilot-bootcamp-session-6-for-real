# API Contract: `/api/projects`

**Branch**: `002-todo-projects` | **Date**: 2026-03-26  
**Base URL**: `/api` (all endpoints are prefixed with `/api`)  
**Content-Type**: `application/json` for all requests and responses

---

## Data Types

### Project Object

```json
{
  "id":        1,
  "title":     "Work",
  "colour":    "blue",
  "createdAt": "2026-03-26T09:00:00.000Z"
}
```

| Field | Type | Notes |
|-------|------|-------|
| `id` | integer | Auto-assigned, immutable |
| `title` | string | Non-empty, max 100 chars, unique (case-insensitive) |
| `colour` | string | One of: `blue`, `green`, `red`, `yellow`, `purple`, `orange`, `teal`, `pink` |
| `createdAt` | string (ISO 8601) | Set on creation, immutable |

### Updated Todo Object

The existing todo response gains one new field:

```json
{
  "id": 1,
  "title": "Write tests",
  "dueDate": "2026-04-01",
  "completed": 0,
  "createdAt": "2026-03-26T10:00:00.000Z",
  "projectId": 3
}
```

`projectId` is `null` when no project is assigned.

---

## Endpoints

### `GET /api/projects`

List all projects ordered by creation date (oldest first).

**Request**: No body, no query parameters.

**Response `200 OK`**:
```json
[
  { "id": 1, "title": "Work", "colour": "blue", "createdAt": "..." },
  { "id": 2, "title": "Personal", "colour": "green", "createdAt": "..." }
]
```
Returns an empty array `[]` when no projects exist.

**Error responses**: `500` on server error.

---

### `POST /api/projects`

Create a new project.

**Request body**:
```json
{
  "title":  "Work",
  "colour": "blue"
}
```

| Field | Required | Validation |
|-------|----------|------------|
| `title` | Yes | Non-empty string after trim, max 100 chars |
| `colour` | Yes | One of the 8 allowed values |

**Response `201 Created`**: Returns the created project object.

```json
{ "id": 1, "title": "Work", "colour": "blue", "createdAt": "..." }
```

**Error responses**:
| Status | Condition |
|--------|-----------|
| `400` | `title` is missing, empty, or exceeds 100 chars |
| `400` | `colour` is missing or not one of the 8 allowed values |
| `409` | A project with the same title already exists (case-insensitive) |
| `500` | Server error |

---

### `PUT /api/projects/:id`

Update a project's title and/or colour. Both fields are optional in the request body; at least one must be provided.

**URL parameter**: `id` — integer project ID.

**Request body** (all fields optional, at least one required):
```json
{
  "title":  "Updated Work",
  "colour": "purple"
}
```

| Field | Validation (when provided) |
|-------|---------------------------|
| `title` | Non-empty string after trim, max 100 chars; must not conflict with another existing project's title (case-insensitive) |
| `colour` | One of the 8 allowed values |

**Response `200 OK`**: Returns the updated project object.

```json
{ "id": 1, "title": "Updated Work", "colour": "purple", "createdAt": "..." }
```

**Error responses**:
| Status | Condition |
|--------|-----------|
| `400` | `id` is not a valid integer |
| `400` | Neither `title` nor `colour` provided |
| `400` | `title` is empty or exceeds 100 chars |
| `400` | `colour` is not one of the 8 allowed values |
| `404` | No project exists with the given `id` |
| `409` | The new `title` conflicts with a different existing project (case-insensitive) |
| `500` | Server error |

---

### `DELETE /api/projects/:id`

Delete a project. All todos that reference this project have their `projectId` set to `null`; the todos themselves are not deleted.

**URL parameter**: `id` — integer project ID.

**Request**: No body.

**Response `200 OK`**:
```json
{ "message": "Project deleted successfully" }
```

**Error responses**:
| Status | Condition |
|--------|-----------|
| `400` | `id` is not a valid integer |
| `404` | No project exists with the given `id` |
| `500` | Server error |

---

## Change to Existing Endpoints

### `POST /api/todos` — accepts optional `projectId`

The create-todo request body now accepts an optional `projectId`:

```json
{
  "title":     "Write tests",
  "dueDate":   "2026-04-01",
  "projectId": 3
}
```

`projectId` must reference an existing project or be `null`/omitted. If a non-existent `projectId` is provided, return `400`.

### `PUT /api/todos/:id` — accepts optional `projectId`

The update-todo request body now accepts an optional `projectId` field.  
Setting `projectId` to `null` explicitly removes the project association.

---

## Allowed Colour Values

The following are the only valid values for the `colour` field on a project:

```
blue | green | red | yellow | purple | orange | teal | pink
```

Any other value MUST be rejected with a `400` status.
