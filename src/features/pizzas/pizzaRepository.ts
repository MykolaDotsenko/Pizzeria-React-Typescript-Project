import { z } from "zod";
import {
  pizzaIdSchema,
  pizzaImageSchema,
  pizzaListSchema,
  pizzaNameSchema,
  pizzaSchema,
  priceCentsSchema,
  type Pizza,
} from "./pizza";
import { seedPizzas } from "./seedPizzas";

const STORAGE_KEY = "pizzasState";
const STORAGE_VERSION = 2;

const versionMarkerSchema = z.object({
  version: z.number().int(),
});

const currentEnvelopeSchema = z.object({
  version: z.literal(STORAGE_VERSION),
  pizzas: z.unknown(),
});

const versionOneEnvelopeSchema = z.object({
  version: z.literal(1),
  pizzas: z.unknown(),
});

const legacyPriceSchema = z
  .union([z.number(), z.string().trim().min(1)])
  .transform((value) => (typeof value === "number" ? value : Number(value)))
  .refine(Number.isFinite)
  .transform((value) => Math.round(value * 100))
  .pipe(priceCentsSchema);

const legacyPizzaSchema = z
  .object({
    id: z
      .union([z.number().int().positive(), z.string().trim().min(1)])
      .transform(String)
      .pipe(pizzaIdSchema),
    title: pizzaNameSchema,
    price: legacyPriceSchema,
    img: pizzaImageSchema,
  })
  .transform(({ id, title, price, img }) => ({
    id,
    name: title,
    priceCents: price,
    image: img,
  }));

export interface PizzaRepository {
  load(): readonly Pizza[];
  save(pizzas: readonly Pizza[]): boolean;
  isWritable(): boolean;
}

function cloneSeedPizzas(): Pizza[] {
  return seedPizzas.map((pizza) => ({ ...pizza }));
}

function normalizeCurrentPizzas(value: unknown): Pizza[] | null {
  if (!Array.isArray(value)) {
    return null;
  }

  if (value.length === 0) {
    return [];
  }

  const pizzas: Pizza[] = [];
  const seenIds = new Set<string>();

  for (const item of value) {
    const parsed = pizzaSchema.safeParse(item);

    if (!parsed.success || seenIds.has(parsed.data.id)) {
      continue;
    }

    seenIds.add(parsed.data.id);
    pizzas.push(parsed.data);
  }

  return pizzas.length > 0 ? pizzas : null;
}

function migrateLegacyPizzas(value: unknown): Pizza[] | null {
  if (!Array.isArray(value)) {
    return null;
  }

  if (value.length === 0) {
    return [];
  }

  const pizzas: Pizza[] = [];
  const seenIds = new Set<string>();

  for (const item of value) {
    const parsed = legacyPizzaSchema.safeParse(item);

    if (!parsed.success || seenIds.has(parsed.data.id)) {
      continue;
    }

    seenIds.add(parsed.data.id);
    pizzas.push(parsed.data);
  }

  return pizzas.length > 0 ? pizzas : null;
}

export function createLocalStoragePizzaRepository(
  storage: Storage | null,
): PizzaRepository {
  let writable = storage !== null;

  function write(pizzas: readonly Pizza[]): boolean {
    if (!storage || !writable) {
      return false;
    }

    const parsed = pizzaListSchema.safeParse(pizzas);

    if (!parsed.success) {
      return false;
    }

    try {
      storage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          version: STORAGE_VERSION,
          pizzas: parsed.data,
        }),
      );
      return true;
    } catch {
      writable = false;
      return false;
    }
  }

  function remove(): void {
    if (!storage) {
      return;
    }

    try {
      storage.removeItem(STORAGE_KEY);
    } catch {
      writable = false;
    }
  }

  return {
    load(): readonly Pizza[] {
      writable = storage !== null;

      if (!storage) {
        return cloneSeedPizzas();
      }

      try {
        const raw = storage.getItem(STORAGE_KEY);

        if (!raw) {
          return cloneSeedPizzas();
        }

        const json: unknown = JSON.parse(raw);
        const versionMarker = versionMarkerSchema.safeParse(json);

        if (
          versionMarker.success &&
          versionMarker.data.version !== 1 &&
          versionMarker.data.version !== STORAGE_VERSION
        ) {
          // Never downgrade or overwrite data written by a schema this version
          // does not understand. The UI remains usable in a read-only fallback.
          writable = false;
          return cloneSeedPizzas();
        }

        const currentEnvelope = currentEnvelopeSchema.safeParse(json);

        if (currentEnvelope.success) {
          const normalized = normalizeCurrentPizzas(currentEnvelope.data.pizzas);

          if (normalized === null) {
            remove();
            return cloneSeedPizzas();
          }

          if (!pizzaListSchema.safeParse(currentEnvelope.data.pizzas).success) {
            write(normalized);
          }

          return normalized;
        }

        const versionOneEnvelope = versionOneEnvelopeSchema.safeParse(json);
        const legacySource = versionOneEnvelope.success
          ? versionOneEnvelope.data.pizzas
          : json;
        const migrated = migrateLegacyPizzas(legacySource);

        if (migrated === null) {
          remove();
          return cloneSeedPizzas();
        }

        write(migrated);
        return migrated;
      } catch {
        remove();
        return cloneSeedPizzas();
      }
    },

    save(pizzas: readonly Pizza[]): boolean {
      return write(pizzas);
    },

    isWritable(): boolean {
      return writable;
    },
  };
}

function getBrowserStorage(): Storage | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export const browserPizzaRepository =
  createLocalStoragePizzaRepository(getBrowserStorage());
