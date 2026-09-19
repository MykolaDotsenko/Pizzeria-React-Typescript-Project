# Architecture

## Goal

Maximize correctness, readability, product realism, and change safety for a small local-first application without introducing infrastructure whose maintenance cost exceeds its value.

## Domain

`pizza.ts` owns the stable domain model:

- identifiers
- name and description rules
- categories
- money in integer cents
- preset and uploaded image variants
- form normalization
- presentation formatting

The UI never stores a floating-point price in domain state. Uploaded images are represented explicitly as a discriminated union rather than overloading a filename string.

## Image boundary

`imageProcessing.ts` is the browser-media boundary.

Before an uploaded image enters domain state it:

1. validates MIME type and source size,
2. decodes the image,
3. preserves aspect ratio,
4. downsizes it through bounded dimensions,
5. converts it to JPEG,
6. lowers quality/dimensions until it fits the storage budget,
7. returns a validated uploaded-image domain value.

This keeps raw multi-megabyte files out of localStorage and makes image persistence deterministic enough for a client-only portfolio application.

## State

`pizzaReducer.ts` contains pure state transitions:

- add
- update
- delete
- restore after Undo
- drag reorder
- one-step accessible move

`PizzasProvider.tsx` integrates React with persistence. An authoritative ref advances synchronously before saving and dispatching, so multiple actions in one event compose against the latest snapshot.

Undo keeps only the most recent deletion in transient UI state while restoration itself remains a reducer transition and is persisted normally.

## Persistence

`pizzaRepository.ts` is the only localStorage-aware module.

Storage version 3 adds description, category, and the image discriminated union. The repository migrates:

- original unversioned arrays,
- version 1 records,
- version 2 records.

Legacy preset filenames become explicit preset-image objects and receive safe default descriptions/categories.

Unknown future schema versions are never modified. The repository returns seed data in read-only mode so an older build cannot destroy newer data.

Write failures such as storage quota exhaustion are surfaced through repository writability and the UI persistence warning.

## UI

The menu screen is optimized around the operator's primary tasks:

- create content,
- find/filter content,
- reorder it,
- edit it,
- remove and recover it.

Desktop drag-and-drop is supplemented by move up/down buttons so ordering remains available to keyboard and mobile users.

Delete uses a non-blocking Undo toast instead of a confirmation modal. This reduces interruption while keeping accidental deletion recoverable.

## Why localStorage for uploaded images?

For a production multi-user system, images belong in object storage/CDN and records belong in a server database.

This project intentionally remains local-first. Resizing and bounding uploaded images provides a realistic photo workflow without adding backend infrastructure that would contribute little additional portfolio signal. Storage quota failures are handled explicitly rather than hidden.

## Testing strategy

1. domain tests — validation and money normalization,
2. reducer tests — CRUD, restore, and ordering invariants,
3. image utility tests — input validation and sizing,
4. repository tests — v1/v2/v3 persistence, migration, corruption, quota, future schema,
5. provider tests — same-event mutation composition,
6. component tests — form validation and upload rejection,
7. route tests — customer-facing details and safe not-found states,
8. Playwright browser matrix — customer flow, operator edit/filter/reorder/delete/Undo, validation, image upload/persistence, and future-schema safety.

The browser suite runs in Chromium, Firefox, WebKit, and mobile Chromium.

## Proportionality

The app still does not need a service layer, generic repository base class, Redux middleware, command bus, dependency-injection container, backend API, or design-system package. Each current abstraction exists because it removes a concrete failure mode or duplication.
