# Testing Strategy

## Vitest

Vitest is used for code that does not require a React renderer:

- API client
- Envelope parsing
- Error mapping
- Query serialization
- Zustand store logic
- Persistence wrappers
- Signature compatibility
- Pure utilities

Test files:

```text
*.test.ts
*.test.tsx
```

## Jest + jest-expo

Jest with jest-expo and React Native Testing Library is used for:

- React hooks
- React Native components
- Providers
- Route guards
- Navigation behavior
- UI interactions

Test files:

```text
*.react.test.ts
*.react.test.tsx
```

## Rules

- Never mock React.
- Never call a component function directly.
- Never copy production logic into a test.
- Mock external dependencies, not the system under test.
- Assert user-visible output and state transitions.
- Both test runners are required by `pnpm test` and `pnpm validate`.

## Running Tests

```bash
# Unit tests (Vitest)
pnpm test:unit

# React Native tests (Jest)
pnpm test:react

# All tests
pnpm test

# Watch mode
pnpm test:unit:watch    # Vitest watch
pnpm test:react:watch   # Jest watch
```

## CI

GitHub Actions runs both test suites as separate steps to allow independent debugging and reporting.
