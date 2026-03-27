# Feature Specification: Project Organisation for Todos

**Feature Branch**: `002-todo-projects`  
**Created**: 2026-03-26  
**Status**: Draft  
**Input**: User description: "Add project support to organize todos with color-coded projects and filtering"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create and Manage Projects (Priority: P1)

A user wants to organise their work into named projects. They open the todo application and create a new project by providing a title and choosing a colour from a predefined palette. The project is saved and becomes available for use throughout the app.

**Why this priority**: This is the foundational capability of the entire feature. Without the ability to create projects, no other part of the feature (assignment, filtering) can function. Delivering this alone already gives users a persistent project list.

**Independent Test**: Open the app. Create a project titled "Work" with a blue colour. The project should appear in the project list immediately and persist after a page reload.

**Acceptance Scenarios**:

1. **Given** no projects exist, **When** the user creates a project with a title and a chosen colour, **Then** the project appears in the project list with the correct title and colour.
2. **Given** an existing project, **When** the user initiates deletion, **Then** a confirmation dialog is shown warning that associated todos will lose their project link; upon confirmation, the project is removed from the project list.
3. **Given** the user attempts to create a project with an empty title, **When** they submit the form, **Then** an error is shown and the project is not saved.
4. **Given** existing projects, **When** the user reloads the application, **Then** all previously created projects are still present.

---

### User Story 2 - Assign a Project to a Todo (Priority: P2)

A user creates a new todo or edits an existing one and wants to associate it with a project to indicate which area of work it belongs to. They select a project from a dropdown on the create/edit form. The todo card then displays a visual indicator (colour dot and project name) showing which project it belongs to. They can also remove the project association from a todo.

**Why this priority**: Assigning todos to projects is the core use case that delivers organisation value. Without this, projects remain disconnected from todos and are not useful.

**Independent Test**: With at least one project created, create a new todo and assign it to a project. The todo card should display the project's colour indicator and name. Edit the todo and remove the project assignment — the indicator should disappear.

**Acceptance Scenarios**:

1. **Given** at least one project exists, **When** the user creates a new todo and selects a project, **Then** the todo is saved with that project association.
2. **Given** a todo with an assigned project, **When** the user edits the todo and assigns a different project, **Then** the todo's project association updates correctly.
3. **Given** a todo with an assigned project, **When** the user edits the todo and removes the project assignment, **Then** the todo has no project association and no project indicator is shown.
4. **Given** a todo with an assigned project, **When** the user views the todo list, **Then** the todo card displays a coloured pill/badge below the todo title containing the project name, with the pill coloured to match the project's chosen colour.
5. **Given** a todo with no assigned project, **When** the user views the todo list, **Then** no project indicator is shown on that card.

---

### User Story 3 - Filter Todos by Project (Priority: P3)

A user has many todos spread across multiple projects and wants to focus on just one project at a time. They select a project chip from the horizontal filter row above the todo list, and the list updates to show only todos belonging to that project. They can return to viewing all todos by clicking the "All" chip.

**Why this priority**: Filtering multiplies the value of project assignment, but it requires P1 and P2 to be in place first. It is independently testable once projects and todo assignments exist.

**Independent Test**: With todos assigned to at least two different projects, activate the project filter for one project. Only todos belonging to that project should be visible. Clear the filter and all todos should reappear.

**Acceptance Scenarios**:

1. **Given** todos assigned to multiple projects, **When** the user filters by a specific project, **Then** only todos assigned to that project are displayed.
2. **Given** an active project filter, **When** the user clears the filter, **Then** all todos are displayed again.
3. **Given** an active project filter, **When** a new todo is created and assigned to a different project, **Then** the new todo does not appear in the currently filtered list.
4. **Given** an active project filter, **When** a new todo is created and assigned to the filtered project, **Then** the new todo appears in the list immediately.
5. **Given** no project filter is active, **When** the user views the todo list, **Then** all todos are shown regardless of their project assignment.

---

### Edge Cases

- What happens when a project is deleted but todos are still assigned to it? The todos remain in the list; they simply lose their project association and display no project indicator.
- What if a user filters by a project that has no todos? An empty state message is shown indicating no todos belong to that project.
- What if the user creates a todo when a project filter is active? The create form pre-selects the currently active filter project as the default project for the new todo.
- What if two projects have the same title? Projects must have unique titles; an error is shown if a duplicate is attempted.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Users MUST be able to create a project by providing a title (required, max 100 characters) and selecting a colour from a predefined palette of exactly 8 named colours drawn from existing design system tokens (blue, green, red, yellow, purple, orange, teal, pink), presented as a colour-swatch picker.
- **FR-002**: Project titles MUST be unique; the system MUST prevent creation of a project with a title that already exists (case-insensitive).
- **FR-003**: Users MUST be able to delete a project; a confirmation dialog MUST be shown before deletion, warning that associated todos will lose their project link. Upon confirmation, deletion MUST remove the project and unassign it from any todos, but MUST NOT delete those todos.
- **FR-004**: All projects MUST be persisted and retrievable after a page reload.
- **FR-005**: When creating a todo, users MUST be able to optionally select a project from the list of existing projects.
- **FR-006**: When editing an existing todo, users MUST be able to assign, change, or remove the project association.
- **FR-007**: Todos with a project assigned MUST display a coloured pill/badge below the todo title containing the project name; the pill background colour MUST match the project's chosen colour with sufficient contrast for the text label.
- **FR-008**: Todos with no project assigned MUST NOT display any project indicator.
- **FR-009**: The todo list MUST include a project filter rendered as a horizontal row of clickable pill/chip buttons — one chip per project plus an "All" chip — displayed above the todo list; the active filter chip is visually highlighted.
- **FR-010**: The project filter MUST include an "All" chip that, when selected, removes the active project filter and shows all todos. The "All" chip is selected by default when no filter is active.
- **FR-011**: The project filter state MUST update the displayed list immediately without a page reload.
- **FR-012**: Users MUST be able to edit an existing project's title and colour after creation; changes to a project's colour MUST be immediately reflected on all todo cards that reference that project.

### Key Entities

- **Project**: Represents an organisational grouping for todos. Key attributes: unique title, chosen colour (from predefined palette), creation date. A project can have zero or many todos associated with it.
- **Todo** (extended): The existing todo entity gains an optional reference to a single Project. Removing a project does not affect the todo's other data.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can create a project and assign it to a new todo in under 60 seconds.
- **SC-002**: Filtering the todo list by project updates the visible results immediately — no page reload is required and the transition is perceptibly instant.
- **SC-003**: All todos correctly display or omit their project indicator with zero incorrect associations visible at any time.
- **SC-004**: Deleting a project results in zero data loss — all previously assigned todos remain in the list, simply without a project indicator.
- **SC-005**: The project colour indicator on a todo card is visually distinct such that users can identify the project without reading the project title.

## Assumptions

- Each todo can belong to at most one project at a time; many-to-many project assignment is out of scope.
- Project colour selection is from a predefined palette of exactly 8 named colours (blue, green, red, yellow, purple, orange, teal, pink) drawn from existing design system tokens; a full custom colour picker is out of scope for v1.
- There is no project hierarchy or nesting; all projects are at the same level.
- The filter allows selection of only one project at a time; multi-project filtering is out of scope for v1.
- The application is single-user, so project data is global (no per-user isolation needed), consistent with the existing todo data model.
- The predefined colour palette will reuse or extend existing design system colour tokens where possible.
- Sorting or ordering projects is out of scope; projects are listed in creation order.
- Project management (create, edit, delete) lives in a dedicated separate view or sidebar section accessible via a nav link or sidebar, distinct from the main todo list view.

## Clarifications

### Session 2026-03-26

- Q: Where does project management (create/edit/delete) live in the UI? → A: Separate view or sidebar — a dedicated "Projects" section accessible via a nav link or sidebar; todos and projects are managed in distinct areas.
- Q: Colour palette — how many colours and which ones? → A: 8 named colours from existing design system tokens (blue, green, red, yellow, purple, orange, teal, pink), presented as a colour-swatch picker.
- Q: Should deleting a project require a confirmation step? → A: Yes — show a confirmation dialog consistent with the existing todo delete pattern; dialog must warn that associated todos will lose their project link.
- Q: How is the project filter UI rendered? → A: Filter chips / pill buttons — a horizontal row of clickable pills (one per project + "All" chip), always visible above the todo list; active chip is visually highlighted.
- Q: Where on the todo card is the project indicator displayed? → A: Coloured badge/tag (pill shape with project name inside), displayed below the todo title.
