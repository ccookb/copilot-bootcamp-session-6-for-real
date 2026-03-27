# Functional Requirements - Todo App

## Overview
A simple, single-user todo application that allows users to create, manage, and track tasks with due dates.

## Core Features

### 1. Todo Item Management

#### 1.1 Create Todo
- **Description**: Users can create a new todo item
- **Required Fields**:
  - Title (string, required, max 255 characters)
  - Due Date (date, optional)
- **Behavior**:
  - New todos are automatically set to incomplete status
  - Todos are persisted immediately upon creation
  - User receives confirmation of successful creation

#### 1.2 View Todos
- **Description**: Users can view all their todos in a simple list
- **Display Information**:
  - Todo title
  - Due date (if set)
  - Completion status (checked/unchecked)
  - Overdue indicator (danger-coloured left border and "Overdue" badge) for incomplete todos whose due date is strictly before today's local date
- **Ordering**: Todos are displayed in order of creation date (newest first)
- **Overdue Display Rules**:
  - An incomplete todo is overdue when its `dueDate` is strictly before today's local date
  - Completed todos never display an overdue indicator regardless of their due date
  - Todos with no due date never display an overdue indicator
  - The overdue state auto-refreshes at minimum once per minute so items transition to overdue without a page reload

#### 1.3 Update Todo Status
- **Description**: Users can mark a todo as complete or incomplete
- **Behavior**:
  - Toggle completion status with a checkbox or button
  - Changes are persisted immediately

#### 1.4 Delete Todo
- **Description**: Users can remove a todo from their list
- **Behavior**:
  - A confirmation dialog is shown before deleting to prevent accidental deletion
  - Delete action removes the todo permanently upon confirmation
  - Changes are persisted immediately

#### 1.5 Update Todo Details
- **Description**: Users can edit a todo's title, due date, and project assignment
- **Behavior**:
  - Users can update the title, due date, and assigned project after creation
  - Changes are persisted immediately

### 2. Project Management

#### 2.1 Create Project
- **Description**: Users can create a new project to organise related todos
- **Required Fields**:
  - Title (string, required, max 100 characters, must be unique case-insensitively)
  - Colour (one of 8 named colours: blue, green, red, yellow, purple, orange, teal, pink)
- **Behavior**:
  - New projects are persisted immediately upon creation
  - Project creation is accessible from a dedicated Projects view

#### 2.2 View Projects
- **Description**: Users can view all their projects in a list from the Projects view
- **Display Information**:
  - Project title with a coloured swatch indicator
  - Edit and delete actions per project

#### 2.3 Update Project
- **Description**: Users can edit a project's title and/or colour
- **Behavior**:
  - Inline edit form replaces the project item on clicking Edit
  - Changes are persisted immediately

#### 2.4 Delete Project
- **Description**: Users can remove a project
- **Behavior**:
  - A confirmation dialog is shown before deleting (consistent with todo delete pattern)
  - Deleting a project removes the project assignment from all associated todos (todos themselves are kept)
  - Delete action is permanent upon confirmation

#### 2.5 Assign Project to Todo
- **Description**: Users can assign a project to a todo on creation or when editing
- **Behavior**:
  - A project dropdown selector appears on the todo creation form when projects exist
  - A project dropdown selector appears in the todo edit form when projects exist
  - The current project (if any) is pre-selected when editing
  - A coloured pill badge below the todo title indicates the assigned project

#### 2.6 Filter Todos by Project
- **Description**: Users can filter the todo list to show only todos assigned to a specific project
- **Behavior**:
  - A horizontal filter chip bar appears above the todo list when at least one project exists
  - An "All" chip shows all todos (default)
  - One chip per project; clicking selects that project's filter
  - Active chip is highlighted with the project's colour
  - Filter state resets to "All" when returning from Projects view

### 3. Persistence

- **Storage Mechanism**: Use the existing backend persistence mechanism (Express.js API)
- **Data Durability**: All todo changes are persisted to the backend
- **Scope**: Single-user application - todos are stored globally (no user-specific isolation needed)

### 3. User Interface

- **Responsiveness**: Desktop-focused, no specific mobile optimization required
- **Simplicity**: Clean, minimal interface focused on core functionality
- **No Advanced Features**:
  - No filtering by status or priority
  - No search functionality
  - No undo/redo
  - No bulk operations

## Out of Scope

- User authentication and authorization
- Multi-user support or collaboration
- Priority levels or categories
- Recurring todos
- Reminders or notifications
- Undo/redo functionality
- Bulk operations
- Advanced filtering or search
- Mobile-specific optimization

## Technical Constraints

- Frontend: React application communicating with backend API
- Backend: Express.js REST API
- No database schema changes beyond basic todo storage
- Single-user application (no user identification required)

## Success Criteria

- [ ] User can create a todo with a title and optional due date
- [ ] User can view all todos in a list with their details displayed
- [ ] User can mark a todo as complete/incomplete
- [ ] User can delete a todo
- [ ] User can edit a todo's title, due date, and project assignment
- [ ] All changes persist through page refresh (backend persistence)
- [ ] Simple, intuitive UI
- [ ] User can create, view, edit, and delete projects
- [ ] User can assign a project to a todo on creation and when editing
- [ ] A project pill badge is displayed on todos with an assigned project
- [ ] User can filter the todo list by project using filter chips
