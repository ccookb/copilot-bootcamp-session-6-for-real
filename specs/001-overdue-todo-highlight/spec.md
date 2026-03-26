# Feature Specification: Support for Overdue Todo Items

**Feature Branch**: `001-overdue-todo-highlight`  
**Created**: 2026-03-25  
**Status**: Draft  
**Input**: User description: "Support for Overdue Todo Items — Users need a clear, visual way to identify which todos have not been completed by their due date."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Visual Overdue Indicator (Priority: P1)

When a user views their todo list, items that are past their due date and still incomplete should be visually highlighted so they immediately stand out from regular or completed items.

**Why this priority**: This is the core value of the feature. Without a visual indicator, users have no way to distinguish overdue items from upcoming ones at a glance — making the due date field far less useful.

**Independent Test**: Create a todo with a due date in the past and leave it incomplete. Open the todo list. The item should display a distinct visual treatment (e.g., red/danger colour, label) without any extra interaction. Completed items with past due dates should appear normal.

**Acceptance Scenarios**:

1. **Given** a todo with a due date of yesterday and a status of incomplete, **When** the user views the todo list, **Then** the todo item is displayed with a visual overdue indicator: the danger colour AND a visible "Overdue" text label/badge.
2. **Given** a todo with a due date of yesterday and a status of complete, **When** the user views the todo list, **Then** the todo item does NOT display an overdue indicator.
3. **Given** a todo with a due date of today and a status of incomplete, **When** the user views the todo list, **Then** the todo item does NOT display an overdue indicator (today is not yet overdue).
4. **Given** a todo with no due date set, **When** the user views the todo list, **Then** no overdue indicator is shown.
5. **Given** a todo that was overdue, **When** the user marks it as complete, **Then** the overdue indicator disappears immediately.

---

### User Story 2 - Overdue Due Date Text Styling (Priority: P2)

When a todo is overdue, the due date text itself should reflect the urgency so users understand at a glance that the deadline has passed, not just that the item is flagged.

**Why this priority**: Colour alone can be missed or inaccessible; styling the date text (e.g., red/danger colour) reinforces the overdue state and provides context about *why* it is flagged.

**Independent Test**: Create a todo with a past due date, leave it incomplete. The due date text (e.g., "Due: Jan 1, 2026") should render in the danger colour rather than the standard secondary text colour.

**Acceptance Scenarios**:

1. **Given** an overdue incomplete todo, **When** the user views the list, **Then** the due date text is styled in the danger/error colour.
2. **Given** a completed todo with a past due date, **When** the user views the list, **Then** the due date text is styled normally (not in danger colour).

---

### Edge Cases

- What happens when the system clock is in a different timezone to the user's local date? The overdue calculation uses the client's local date so the user sees results consistent with their own calendar.
- What if a todo's due date is exactly today? Today is NOT considered overdue — only dates strictly before today trigger the indicator.
- What if a todo has no due date? No overdue indicator is shown; the absence of a due date means there is no deadline to be overdue against.
- What if the user sets a due date to a past date when creating or editing a todo? The overdue indicator should appear immediately upon saving.
- What if the app is open when midnight passes and a todo's due date is today? The overdue state MUST update automatically (no page refresh required); a periodic clock-tick check (at minimum once per minute) ensures items transition to overdue as soon as the date changes.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST visually distinguish incomplete todo items whose due date is strictly before the current local date by applying a danger-coloured left border to the todo card.
- **FR-002**: The overdue visual indicator MUST be displayed without any user interaction (e.g., no hover or click required).
- **FR-003**: Completed todo items MUST NOT display an overdue indicator, regardless of their due date.
- **FR-004**: Todo items with no due date set MUST NOT display an overdue indicator.
- **FR-005**: The overdue visual indicator MUST use the established danger/error colour from the design system (red: `#c62828` light mode, `#ef5350` dark mode) applied as a left border on the todo card, and MUST render correctly in both light and dark modes. In addition to colour, a visible text label (e.g., "Overdue" badge) MUST be displayed to ensure the indicator is accessible to colour-blind users and screen readers.
- **FR-006**: The overdue state MUST be recalculated and reflected immediately when a todo's completion status changes (e.g., marking complete removes the indicator instantly).
- **FR-007**: When a todo is in an overdue state, the due date text MUST also be styled in the danger colour to reinforce the urgency.
- **FR-008**: The overdue state MUST be recalculated automatically at runtime (e.g., via a periodic clock-tick check, at minimum once per minute) so that items whose due date passes while the app is open become overdue without requiring a page refresh.

### Key Entities

- **Todo Item**: Existing entity; relevant attributes are `dueDate` (optional date), `completed` (boolean). No data model changes are required — overdue status is derived from these fields at display time.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can identify all overdue todos in their list without reading or comparing individual dates — overdue items are visually distinct at a glance.
- **SC-002**: Zero overdue indicators are shown for completed todos or todos without a due date.
- **SC-003**: The overdue indicator appears and disappears in real time when a user toggles the completion status of an overdue todo — no page refresh required.
- **SC-004**: Overdue styling is consistent and correct in both light mode and dark mode, with no colour contrast or theming issues.

## Assumptions

- "Overdue" is defined as: due date is strictly before today's local date AND the todo is incomplete. Todos due today are not considered overdue.
- No new backend fields or API changes are needed; overdue status is a purely client-side, display-time calculation based on existing `dueDate` and `completed` fields.
- Filtering, sorting by overdue status, and bulk actions on overdue items are out of scope for this feature.
- The existing danger colour tokens in the design system (`#c62828` / `#ef5350`) are the correct visual treatment; no new design tokens are introduced.
- Both light mode and dark mode are in scope, consistent with the project's existing theme support.

## Clarifications

### Session 2026-03-25

- Q: Should the overdue indicator include a non-colour cue in addition to the danger colour? → A: Text label — add a small "Overdue" badge/label alongside the colour.
- Q: Should the overdue state update automatically if midnight passes while the app is open? → A: Yes, auto-refresh via periodic clock-tick check (at minimum once per minute).
- Q: Where on the TodoCard should the card-level danger colour be applied? → A: Left border — a danger-coloured left border on the overdue card.

