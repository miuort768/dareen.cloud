# ADR-003: Compound Form Components with React Context

**Status:** Accepted  
**Date:** 2026-07-12  
**Deciders:** Dareen Design System Team

## Context

Form fields (`<Input>`, `<Select>`, `<Textarea>`) each had duplicated label/error/helperText rendering logic. Adding new field types meant reimplementing the same pattern. Error messages were inconsistently styled.

## Decision

Create a **compound component** pattern:

```tsx
<FormField.Root error={error} required={required} size={size}>
  <FormField.Label>Username</FormField.Label>
  <Input />
  <FormField.Hint>Optional hint text</FormField.Hint>
  <FormField.Error>{error}</FormField.Error>
</FormField.Root>
```

- `FormField` uses React Context to share `id`, `error`, `required`, `size` with children
- Each field component (`Input`, `Select`, `Textarea`) detects `FormField` context
- If used standalone (no context), the component auto-wraps in `FormField.Root` for backward compat

## Rationale

1. **Consistency:** All form fields share label styling, error display, spacing
2. **Composability:** Consumers can reorder label/hint/error freely
3. **Backward compat:** `Input` still accepts `label`, `error`, `helperText` as top-level props
4. **Context efficiency:** One context provider per field instead of prop drilling

## Consequences

- All new form fields should render inside `FormField.Root`
- `Input`, `Textarea`, `Select` already migrated
- Future fields (FileUpload, DatePicker, etc.) use same pattern
