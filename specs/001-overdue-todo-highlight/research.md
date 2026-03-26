# Research: Support for Overdue Todo Items

**Phase**: 0 — Pre-design research  
**Branch**: `001-overdue-todo-highlight`  
**Date**: 2026-03-25

## Research Questions

The following questions were identified when filling the Technical Context section of `plan.md`. All are now resolved.

---

### RQ-1: Correct approach for deriving "overdue" from a date string

**Question**: How should `dueDate` (ISO date string e.g. `"2026-03-20"`) be compared against today's local date in JavaScript without timezone pitfalls?

**Decision**: Compare using local-date components, not raw `Date` object arithmetic.

```js
// Safe local-date comparison
function isOverdue(dueDate, completed) {
  if (!dueDate || completed) return false;
  const today = new Date();
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const due = new Date(dueDate + 'T00:00:00'); // force local midnight interpretation
  return due < todayMidnight;
}
```

**Rationale**: `new Date("2026-03-20")` (ISO date-only) is parsed as UTC midnight by the spec, which shifts the apparent day when the user's local timezone is behind UTC. Adding `T00:00:00` (no timezone suffix) forces local midnight parsing in all major browsers, making the comparison consistent with the user's calendar — exactly per the spec's timezone requirement.

**Alternatives considered**:
- `new Date(dueDate) < new Date()` — rejected: compares against current UTC time, not local midnight; items due "today" in local time may appear overdue if user is UTC-negative.
- `date-fns` or `dayjs` library — rejected: new runtime dependency; unnecessary for a single date comparison (Constitution I / YAGNI).

---

### RQ-2: Pattern for automatic midnight refresh in a React component

**Question**: What is the simplest React pattern to ensure `isOverdue` is re-evaluated at (or just after) midnight without a page refresh?

**Decision**: `useEffect` + `setInterval` inside `TodoCard`, updating a local `now` state every 60 seconds.

```js
const [now, setNow] = useState(new Date());

useEffect(() => {
  const timer = setInterval(() => setNow(new Date()), 60_000);
  return () => clearInterval(timer);
}, []);
```

`isOverdue` uses `now` instead of `new Date()` directly, so it re-evaluates every minute.

**Rationale**: Self-contained; no prop threading; cleans up on unmount; 60-second granularity satisfies FR-008 ("at minimum once per minute"). The interval is per `TodoCard` instance, which is acceptable for a list of ~10–50 items on a learning platform.

**Alternatives considered**:
- Context / global clock — rejected: over-engineering for this scope (Constitution I).
- Interval in `App.js` passing `currentDate` as prop — rejected: requires prop threading through `TodoList` and `TodoCard`; adds coupling with no benefit at this scale.
- `requestAnimationFrame` loop — rejected: wasteful battery/CPU consumption for a once-per-minute check.

---

### RQ-3: CSS approach for the left border overdue indicator

**Question**: What is the correct CSS property and value to add a danger-coloured left border to `.todo-card` without disrupting the existing layout?

**Decision**: Use `border-left` on the `.todo-card--overdue` modifier class, matching the card's existing `border` radius and layout.

```css
.todo-card--overdue {
  border-left: 4px solid var(--danger-color);
}
```

**Rationale**: The existing `.todo-card` already uses `border-radius` and box-shadow; adding only a `border-left` rule preserves the card geometry. `var(--danger-color)` automatically resolves to `#c62828` (light) or `#ef5350` (dark), satisfying FR-005 and Constitution IV.

**Alternatives considered**:
- `outline` — rejected: does not support single-side styling.
- `box-shadow: inset` left trick — rejected: more complex and less readable.
- Separate left-border `div` element — rejected: unnecessary DOM node (Constitution I).

---

### RQ-4: Testing strategy for timer-based overdue logic

**Question**: How should `setInterval` and date-dependent logic be tested in Jest?

**Decision**: Use `jest.useFakeTimers()` for interval control and mock `Date` constructor for date-dependent assertions.

```js
// In test file
beforeEach(() => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date('2026-03-25T10:00:00')); // fixed "today"
});

afterEach(() => {
  jest.useRealTimers();
});

it('updates overdue status after interval tick', () => {
  // render with due date = today (not overdue)
  // advance time past midnight
  act(() => { jest.advanceTimersByTime(60_000); });
  // re-assert overdue state
});
```

**Rationale**: `@testing-library/react` works with fake timers via `act()`. Mocking `Date` ensures the test is independent of the real system clock (Constitution II: "tests MUST be independent").

**Alternatives considered**:
- Passing a `now` prop to `TodoCard` — considered: would simplify testing but adds a prop purely for testability, which is a mild YAGNI violation (Constitution I). Fake timers are the idiomatic Jest approach.

---

## Summary of Decisions

| ID | Decision | Key Rationale |
|----|----------|---------------|
| D1 | `new Date(dueDate + 'T00:00:00')` for local date parsing | Avoids UTC-shift timezone bug |
| D2 | `useEffect`/`setInterval` inside `TodoCard` for midnight refresh | Self-contained; no prop threading; cleans up on unmount |
| D3 | `border-left: 4px solid var(--danger-color)` on `.todo-card--overdue` | Minimal CSS; uses design token; auto dark-mode |
| D4 | `jest.useFakeTimers()` + `jest.setSystemTime()` for interval tests | Idiomatic; test-independent of system clock |

All NEEDS CLARIFICATION items are resolved. Ready for Phase 1 design.
