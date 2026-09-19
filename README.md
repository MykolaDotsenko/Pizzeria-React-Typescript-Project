# Pizzeria — React + TypeScript

A small, production-minded single-page application for managing a pizzeria menu.

Live demo: https://pizza-react-typescript.vercel.app

## Features

- View, add, edit, and delete pizzas
- Dedicated pizza detail routes
- Local persistence through a repository boundary
- Runtime validation with Zod
- Safe recovery from corrupt or invalid browser storage
- Keyboard-accessible edit and delete controls
- Responsive mobile and desktop layout
- Automated unit and component tests
- CI checks for type safety, tests, and production build

## Tech stack

React 18, TypeScript strict mode, React Router, Zod, Vite, Vitest, React Testing Library, GitHub Actions, and Vercel.

## Architecture

The UI does not read or write localStorage directly. pizzaRepository owns persistence and validates stored data before the application trusts it. usePizzas owns CRUD state and keeps persistence synchronized.

## Data safety

Pizza has one runtime schema and TypeScript types are derived from that schema. If stored JSON is corrupted or does not match the schema, the app safely falls back to the demo menu.

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

Configured for Vercel with an SPA rewrite so direct navigation to routes such as /pizza/2 works correctly.

## History

This project started as a Create React App learning exercise in 2024. It was later modernized to Vite with validation, tests, accessibility improvements, responsive styling, CI, and safer routing.
