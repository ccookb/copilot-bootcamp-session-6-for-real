<!--
SYNC IMPACT REPORT
==================
Version change: (unversioned template) → 1.0.0
Modified principles: ALL (initial fill from template placeholders)
Added sections: Core Principles (×5), Technology Constraints, Development Workflow, Governance
Removed sections: N/A (initial ratification)
Templates requiring updates:
  ✅ .specify/templates/plan-template.md — Constitution Check section is generic; gates now derivable from principles
  ✅ .specify/templates/spec-template.md — no amendment required; FR conventions align with Principle V
  ✅ .specify/templates/tasks-template.md — test task guidance aligns with Principle II (test-first)
Follow-up TODOs: None — all placeholders resolved.
-->

# Copilot Bootcamp Todo App Constitution

## Core Principles

### I. Simplicity First (NON-NEGOTIABLE)

Every implementation decision MUST favour the simplest solution that satisfies the
stated requirement. Complexity requires an explicit, recorded justification.

- Each module, component, and function MUST have a single, well-defined responsibility (SRP).
- Solutions MUST NOT add features, abstractions, or configuration beyond what is
  currently required (YAGNI).
- Complex logic MUST be broken into small, named functions whose purpose is
  self-evident from the name alone.
- Performance optimisations MUST only be introduced when a measurable problem exists;
  premature optimisation is a violation of this principle.

**Rationale**: The codebase is a learning platform. Unnecessary complexity obscures
intent and raises the barrier for new contributors.

### II. Test-First Development (NON-NEGOTIABLE)

Tests MUST be written before, or concurrently with, the code they validate;
no feature is complete without passing tests.

- Unit tests are REQUIRED for all components, services, and utility functions.
- Integration tests are REQUIRED for component interactions and API communication.
- Code coverage MUST meet or exceed **80%** across all packages at every merge.
- Tests MUST be independent: each test sets up its own state and MUST NOT rely
  on execution order or shared mutable state.
- All external dependencies (API calls, timers, storage) MUST be mocked in unit tests.
- Test files MUST reside in `__tests__/` directories co-located with source files
  and follow the naming convention `{filename}.test.js`.

**Rationale**: Tests are the primary mechanism for validating correctness and
documenting expected behaviour; skipping them defers risk to production.

### III. Consistent Code Standards

All code MUST conform to the project's style and quality conventions without exception.

- Indentation: **2 spaces** everywhere (JS, JSON, CSS, Markdown).
- Naming: `camelCase` for variables/functions, `PascalCase` for components/classes,
  `UPPER_SNAKE_CASE` for constants.
- Lines MUST NOT exceed **100 characters**.
- Imports MUST be ordered: external libraries → internal modules → styles,
  with a blank line separating each group.
- Duplication MUST be eliminated through shared utilities, hooks, or components
  before a second usage is committed (DRY).
- ESLint MUST pass with zero errors before any commit; warnings MUST be resolved
  before opening a pull request.
- Trailing whitespace and non-LF line endings are forbidden.

**Rationale**: Consistent style reduces cognitive load during code review and
shortens the onboarding time for new contributors.

### IV. User-Centered Design

Every UI decision MUST serve the user's task completion, not aesthetic novelty.

- The design system (8px grid, defined colour palette, typography scale) MUST be
  followed for all visual elements; ad-hoc values are forbidden.
- Both **light mode** and **dark mode** MUST be supported; all new components
  MUST render correctly in each theme.
- Interactive elements MUST provide visible hover, focus, and disabled states
  as specified in the UI guidelines.
- Destructive actions (e.g., delete) MUST always require a confirmation dialog
  before execution.
- The application MUST be desktop-focused with a maximum content width of **600px**;
  mobile-specific optimisation is out of scope.

**Rationale**: The UI guidelines encode deliberate design decisions; deviating
from them produces an inconsistent experience and increases maintenance burden.

### V. Defined Feature Scope

The application MUST implement only the requirements listed in
`docs/functional-requirements.md`; no gold-plating is permitted.

- Out-of-scope items (authentication, multi-user support, priorities, search,
  undo/redo, bulk operations) MUST NOT be implemented unless the requirements
  document is formally updated.
- All todo state MUST be persisted to the Express.js backend immediately; local-only
  state persistence is forbidden.
- Todos MUST be displayed in reverse-creation order (newest first).
- The title field is REQUIRED (max 255 characters); the due date field is OPTIONAL.

**Rationale**: Clear scope boundaries prevent scope creep, keep the codebase
predictable, and ensure the learning objectives of the bootcamp are met.

## Technology Constraints

This project is a **React + Node.js monorepo** managed via npm workspaces.

- **Frontend**: React (packages/frontend/); tested with Jest + @testing-library/react.
- **Backend**: Node.js / Express.js (packages/backend/); tested with Jest.
- **Monorepo tooling**: npm workspaces; `npm run start` from root starts both packages;
  `npm test` from root runs all tests.
- **Node.js**: v16 or higher; **npm**: v7 or higher.
- No additional runtime dependencies MUST be introduced without team discussion;
  the dependency list MUST be kept minimal.
- No database schema changes beyond basic todo storage are permitted.

## Development Workflow

The following gates MUST be satisfied before any code is merged:

1. **Lint gate**: `npm run lint` produces zero errors across all packages.
2. **Test gate**: `npm test` passes with ≥ 80% code coverage across all packages.
3. **Review gate**: At least one peer review approving the change.
4. **Scope gate**: All changes are traceable to a requirement in
   `docs/functional-requirements.md` or a recorded constitution amendment.

Pull requests that fail any gate MUST NOT be merged, regardless of urgency.

## Governance

This constitution supersedes all other practices and guidelines where conflicts exist.
The docs in `docs/` are subordinate references that provide detail; this document
states the non-negotiable rules.

- Amendments require: a description of the change, the version bump rationale
  (MAJOR/MINOR/PATCH per semantic versioning), and an update to `LAST_AMENDED_DATE`.
- MAJOR bumps (backward-incompatible governance changes): require explicit team
  sign-off and a recorded migration plan.
- MINOR bumps (new principle or materially expanded guidance): require one reviewer.
- PATCH bumps (wording, typo, clarification): may be self-approved.
- All feature plans MUST include a Constitution Check section that maps each
  principle to a pass/fail gate before implementation begins.
- Complexity violations MUST be logged in the plan's Complexity Tracking table
  with a justification; undocumented violations are grounds for rejection.

**Version**: 1.0.0 | **Ratified**: 2026-03-25 | **Last Amended**: 2026-03-25
