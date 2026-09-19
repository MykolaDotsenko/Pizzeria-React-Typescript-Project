# Pizzeria Studio

A production-minded local-first React application for creating and maintaining a small pizzeria menu.

**Canonical demo:** https://pizza-react-typescript.vercel.app

## Product capabilities

- create and edit pizzas with validated name, description, category, price, and photo
- choose a preset photo or upload a JPG/PNG/WebP image
- uploaded photos are resized and converted to compact JPEG data locally in the browser
- search by name or description
- filter by category
- reorder the menu with drag-and-drop or accessible move up/down controls
- delete with a non-blocking Undo action
- persist menu order, edits, uploaded photos, and deletions locally
- dedicated pizza detail routes
- safe schema migrations from the original app through storage version 3

## Current stack

- React 19.3
- React Router 8
- TypeScript 6.0.x in strict mode (kept within the officially supported `typescript-eslint` range)
- Vite 8
- Zod 4
- Vitest 5 + React Testing Library
- Playwright browser matrix: Chromium, Firefox, WebKit, and mobile Chromium
- ESLint flat config + typed linting
- Prettier
- GitHub Actions CI
- Vercel SPA deployment

## Architecture

The app intentionally stays a compact vertical feature slice:

    src/
      app/
      features/pizzas/
        pizza.ts
        seedPizzas.ts
        imageProcessing.ts
        pizzaRepository.ts
        pizzaReducer.ts
        PizzasContext.ts
        PizzasProvider.tsx
        PizzaForm.tsx
        PizzaCard.tsx
        MenuPage.tsx
        PizzaDetailsPage.tsx
      test/

Core rules:

1. **Domain data is validated at boundaries.**
2. **Money is stored as integer cents.**
3. **State transitions are pure reducer operations.**
4. **Persistence is isolated behind one repository adapter.**
5. **Images are processed locally before persistence.**
6. **Old schemas migrate forward; unknown future schemas are never overwritten.**
7. **Same-event mutations compose against one authoritative in-memory snapshot.**
8. **Reordering and Undo are domain transitions, not ad-hoc UI state mutations.**
9. **The architecture remains proportional to the size of the application.**

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the rationale and trade-offs.

## Local development

Supported Node.js lines: 22.22.2+, 24.15.0+, or 26+. The range mirrors the strictest runtime requirements of the development toolchain.

    npm ci
    npm run dev

Quality checks:

    npm run check

Browser tests:

    npx playwright install chromium firefox webkit
    npm run test:e2e

## Persistence

The current storage envelope is version 3. A pizza contains:

    {
      "id": "uuid-or-legacy-id",
      "name": "Pepperoni",
      "description": "Tomato, mozzarella, pepperoni, and oregano.",
      "category": "classic",
      "priceCents": 1290,
      "image": {
        "kind": "preset",
        "value": "pizza-1.jpg"
      }
    }

Uploaded images use the same image field with `kind: "uploaded"` and a locally optimized JPEG data URL.

Storage versions 1 and 2 migrate forward to version 3. Corrupt individual records are isolated where possible. Unknown future versions are preserved byte-for-byte and the application switches persistence to read-only fallback mode instead of downgrading the data.

## Product scope

This is deliberately a **local-first portfolio application**, not a POS or multi-user restaurant SaaS. Its product features are chosen to demonstrate realistic menu-management UX while keeping infrastructure proportional: there is no account system, remote database, CDN, payments, or multi-device synchronization.

## Deployment

Vercel is the canonical deployment. `vercel.json` rewrites SPA routes to the application shell so direct routes such as `/pizza/1` resolve correctly.
