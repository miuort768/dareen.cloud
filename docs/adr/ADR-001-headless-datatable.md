# ADR-001: Headless DataTable with Render-Props Pattern

**Status:** Accepted  
**Date:** 2026-07-12  
**Deciders:** Dareen Design System Team

## Context

The project had multiple hand-rolled `<table>` implementations across StudentTable, TeacherTable, TrialSessions, etc., each with duplicated sorting, filtering, and mobile-responsive logic. We needed a single shared DataTable component.

## Decision

Use a **Headless API** with:
- Generic `Column<T>` interface defining `key`, `header`, `render`, `sortable`, `align`, `className`
- `Table<T>` component that handles layout, sorting, responsiveness
- `mobileCard` render prop for mobile/tablet card views
- Uncontrolled (internal state) + controlled (external `sortKey`/`sortDir`) sort modes

## Rationale

1. **Type safety:** Generic `<T>` ensures column data accessors match row type
2. **Flexibility:** Render props allow any custom cell content without coupling to data shape
3. **Separation of concerns:** Table owns layout/sort/accessibility; consumer owns presentation
4. **Mobile-first:** `mobileCard` prop forces each consumer to design mobile layout explicitly

## Consequences

- All new tables use `<Table<Type> columns={...} data={...} />`
- Old tables migrate one-by-one (StudentTable done, TeacherTable pending)
- Sorting is client-side by default; server-side sort requires controlled mode with `onSort`
