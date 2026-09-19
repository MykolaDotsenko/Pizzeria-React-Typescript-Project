# Pizzeria — React + TypeScript

A small, production-minded single-page application for managing a pizzeria menu.

Live demo: https://pizza-react-typescript.vercel.app

## Features

- View, add, edit, and delete pizzas
- Dedicated pizza detail routes
- Local persistence behind a versioned repository boundary
- Runtime validation and legacy-data migration with Zod
- Safe recovery from corrupt or partially invalid browser storage
- Keyboard-accessible edit and delete controls
- Field-level accessible validation errors
- Responsive mobile and desktop layout
- Automated unit and component tests
- CI checks for type safety, tests, and production build

## Tech stack

React 18, TypeScript strict mode, React Router, Zod, Vite, Vitest, React Testing Library, GitHub Actions, and Vercel.

## Architecture

Application pizza state lives in a provider above the router, so list and detail pages read the same in-memory source of truth. React state updater functions remain pure; persistence is performed in an effect.

The UI does not read or write localStorage directly. pizzaRepository owns persistence, validates stored data, migrates the original unversioned 2024 format, converts legacy string prices, removes unrecoverable records, deduplicates ids, and writes a versioned storage envelope.

## Data safety

Pizza has one runtime schema and TypeScript types are derived from that schema. Prices must be between €0.01 and €1000 and may have at most two decimal places.

If stored JSON is corrupted or contains no recoverable pizzas, the app safely falls back to the demo menu. If only some legacy records are invalid, valid records are preserved.

If browser storage cannot be written, the app stays usable but clearly warns that changes are temporary instead of silently pretending they were saved.

## Local development

Node.js 20+.

    npm install
    npm run dev

Quality checks:

    npm run typecheck
    npm test
    npm run build

Run everything:

    npm run check

## Deployment

The canonical deployment is configured for Vercel with an SPA rewrite so direct navigation to routes such as /pizza/2 works correctly.

## History

This project started as a Create React App learning exercise in 2024. It was later modernized to Vite with runtime validation, versioned persistence, migration support, tests, accessibility improvements, responsive styling, CI, and safer routing.
