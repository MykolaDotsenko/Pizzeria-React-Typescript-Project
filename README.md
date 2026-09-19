# Pizzeria Studio

A production-minded local-first React application for creating and maintaining a small pizzeria menu.

**Canonical demo:** https://pizza-react-typescript.vercel.app

## Why this project exists

The original 2024 learning project was deliberately modernized rather than replaced. The current version demonstrates how a small application can use production-grade boundaries without carrying enterprise-scale complexity.

## Current stack

- React 19.3
- React Router 8
- TypeScript 6 in strict mode
- Vite 8
- Zod 4
- Vitest 5 + React Testing Library
- Playwright end-to-end smoke tests
- ESLint flat config + typed linting
- Prettier
- GitHub Actions CI
- Vercel SPA deployment

TypeScript 6 is intentional: the lint toolchain officially supports TypeScript versions below 6.1, so this repository prioritizes a fully supported toolchain over adopting TypeScript 7 before the surrounding ecosystem declares support.

## Architecture

The app uses one vertical feature slice for the pizza domain:

    src/
      app/
        App.tsx
        AppErrorBoundary.tsx
        NotFoundPage.tsx
      features/pizzas/
        pizza.ts
        seedPizzas.ts
        pizzaRepository.ts
        pizzaReducer.ts
        PizzasContext.ts
        PizzasProvider.tsx
        PizzaForm.tsx
        PizzaCard.tsx
        DeletePizzaDialog.tsx
        MenuPage.tsx
        PizzaDetailsPage.tsx
      test/
        setup.ts

Core rules:

1. **Domain data is trusted only after validation.** Zod guards forms and persisted storage.
2. **Money is stored as integer cents.** UI strings never become floating-point domain money.
3. **State transitions are pure.** CRUD behavior lives in a reducer; persistence is an external side effect.
4. **Persistence is behind an adapter.** UI code never reads or writes localStorage.
5. **Migrations preserve user data.** Old unversioned and v1 records migrate to the current v2 model.
6. **The architecture stays proportional.** There is no service layer, command bus, or generic repository abstraction without a real use case.

More detail is in [ARCHITECTURE.md](./ARCHITECTURE.md).

## Quality gates

Install with a reproducible lockfile:

    npm ci

Run locally:

    npm run dev

Run deterministic quality checks:

    npm run check

Run browser tests:

    npx playwright install chromium
    npm run test:e2e

Every pull request runs formatting, linting, strict type checking, unit/component tests, a production build, and a Chromium end-to-end smoke flow.

## Persistence

The current browser format is version 2:

    {
      "version": 2,
      "pizzas": [
        {
          "id": "uuid-or-legacy-id",
          "name": "Pepperoni",
          "priceCents": 1290,
          "image": "pizza-1.jpg"
        }
      ]
    }

The repository migrates the original array format and version 1 records, including legacy string prices. Corrupt records are isolated instead of making the whole application crash.

## Deployment

Vercel is the canonical deployment. `vercel.json` rewrites SPA routes to the application shell so deep links such as `/pizza/1` resolve correctly.

The repository's legacy GitHub Pages setting may still publish repository source via Jekyll. It should be disabled in repository settings unless a dedicated Vite Pages workflow is configured.
