# Architecture

## Goal

Maximize correctness, readability, and change safety for a small client-only application without introducing layers whose maintenance cost exceeds their value.

## Boundaries

### Domain

`pizza.ts` owns the stable domain vocabulary: pizza types, identifiers, image choices, currency conversion, and validation schemas.

Money is represented as integer cents. This avoids floating-point persistence bugs and makes formatting a presentation concern.

### State

`pizzaReducer.ts` contains pure state transitions. Reducer tests can prove CRUD behavior without React, the DOM, or browser storage.

`PizzasProvider.tsx` is the integration boundary between React state and infrastructure. It generates IDs, composes state transitions, persists the exact next snapshot, and dispatches the same action to React.

An internal ref tracks the latest committed snapshot synchronously. This matters when two mutations happen in the same event before React has rendered again: the second mutation composes on top of the first rather than persisting stale state.

### Infrastructure

`pizzaRepository.ts` is the only localStorage-aware module.

It validates current records, migrates legacy records, salvages valid rows from partially corrupt payloads, deduplicates identifiers, uses versioned envelopes, and reports write failure without throwing into the UI.

If storage contains a versioned payload that this application does not understand, the repository preserves it byte-for-byte, blocks writes, and returns seed data as a safe read-only fallback. This prevents an older application build from silently downgrading newer user data.

The repository can be constructed with any `Storage` implementation, which keeps tests deterministic and leaves room for another persistence adapter without changing UI code.

### UI

The pizza feature owns its forms, cards, pages, and delete confirmation.

Add and edit use the same `PizzaForm` component so validation, labels, error semantics, and input behavior cannot drift apart.

Each delete dialog receives a unique React-generated title id, avoiding duplicate DOM ids while keeping `aria-labelledby` relationships explicit.

## Why not more layers?

This app does not need a generic repository base class, a use-case/service layer around three CRUD actions, global state middleware, server-state tooling, dependency injection containers, or a design-system package.

Those patterns become valuable at larger scale. Here they would add indirection without reducing meaningful risk.

## Testing strategy

1. Domain tests — schemas and money conversion.
2. Reducer tests — pure CRUD invariants.
3. Repository tests — persistence, corruption recovery, migrations, and unknown-version preservation.
4. Provider tests — same-event mutation composition.
5. Component tests — user-facing form and accessibility behavior.
6. Route tests — details/not-found semantics.
7. Playwright — create/search/navigation, edit/reload/delete, validation, 404s, and future-schema protection across Chromium, Firefox, WebKit, and a mobile Chromium viewport.

The CI pipeline treats format, lint, type checking, tests, build, and browser testing as independent gates.

## Operational decisions

- React 19.3 and Vite 8 keep the runtime/build stack current.
- TypeScript 6 is used until typescript-eslint officially supports TypeScript 7.
- Node 22.22+ is the minimum because React Router 8 requires it.
- System fonts remove a render-blocking third-party font dependency.
- `prefers-reduced-motion` is honored.
- Image URLs and favicon URLs use Vite's base URL rather than assuming root hosting.
