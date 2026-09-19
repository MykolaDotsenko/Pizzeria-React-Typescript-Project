import { z } from "zod";
import {
  PIZZA_IMAGE_VALUES,
  createPresetPizzaImage,
  pizzaIdSchema,
  pizzaListSchema,
  pizzaNameSchema,
  pizzaSchema,
  priceCentsSchema,
  type Pizza,
  type PizzaCategory,
} from "./pizza";
import { seedPizzas } from "./seedPizzas";

const STORAGE_KEY = "pizzasState";
const STORAGE_VERSION = 3;
const LEGACY_DESCRIPTION = "A house favorite from the local menu.";

const versionMarkerSchema = z.object({
  version: z.number().int(),
});

const currentEnvelopeSchema = z.object({
  version: z.literal(STORAGE_VERSION),
  pizzas: z.unknown(),
});

const versionTwoEnvelopeSchema = z.object({
  version: z.literal(2),
  pizzas: z.unknown(),
});

const versionOneEnvelopeSchema = z.object({
  version: z.literal(1),
  pizzas: z.unknown(),
});

const versionTwoPizzaSchema = z
  .object({
    id: pizzaIdSchema,
    name: pizzaNameSchema,
    priceCents: priceCentsSchema,
    image: z.enum(PIZZA_IMAGE_VALUES),
  })
  .transform(({ id, name, priceCents, image }) => ({
    id,
    name,
    description: LEGACY_DESCRIPTION,
    category: inferLegacyCategory(name),
    priceCents,
    image: createPresetPizzaImage(image),
  }));

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
    img: z.enum(PIZZA_IMAGE_VALUES),
  })
  .transform(({ id, title, price, img }) => ({
    id,
    name: title,
    description: LEGACY_DESCRIPTION,
    category: inferLegacyCategory(title),
    priceCents: price,
    image: createPresetPizzaImage(img),
  }));

export interface PizzaRepository {
  load(): readonly Pizza[];
  save(pizzas: readonly Pizza[]): boolean;
  isWritable(): boolean;
}

function inferLegacyCategory(name: string): PizzaCategory {
  const normalized = name.toLocaleLowerCase("en");

  if (
    normalized.includes("veg") ||
    normalized.includes("margherita") ||
    normalized.includes("margarita") ||
    normalized.includes("cheese")
  ) {
    return "vegetarian";
  }

  if (
    normalized.includes("spicy") ||
    normalized.includes("hot") ||
    normalized.includes("diavola")
  ) {
    return "spicy";
  }

  return "classic";
}

function cloneSeedPizzas(): Pizza[] {
  return seedPizzas.map((pizza) => ({ ...pizza, image: { ...pizza.image } }));
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

function migrateWithSchema(
  value: unknown,
  schema: typeof versionTwoPizzaSchema | typeof legacyPizzaSchema,
): Pizza[] | null {
  if (!Array.isArray(value)) {
    return null;
  }

  if (value.length === 0) {
    return [];
  }

  const pizzas: Pizza[] = [];
  const seenIds = new Set<string>();

  for (const item of value) {
    const parsed = schema.safeParse(item);

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
  let blockedByUnknownVersion = false;
  let storageWritable = storage !== null;

  function write(pizzas: readonly Pizza[]): boolean {
    if (!storage || blockedByUnknownVersion) {
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
      storageWritable = true;
      return true;
    } catch {
      storageWritable = false;
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
      storageWritable = false;
    }
  }

  return {
    load(): readonly Pizza[] {
      blockedByUnknownVersion = false;
      storageWritable = storage !== null;

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
          ![1, 2, STORAGE_VERSION].includes(versionMarker.data.version)
        ) {
          blockedByUnknownVersion = true;
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

        const versionTwoEnvelope = versionTwoEnvelopeSchema.safeParse(json);

        if (versionTwoEnvelope.success) {
          const migrated = migrateWithSchema(
            versionTwoEnvelope.data.pizzas,
            versionTwoPizzaSchema,
          );

          if (migrated === null) {
            remove();
            return cloneSeedPizzas();
          }

          write(migrated);
          return migrated;
        }

        const versionOneEnvelope = versionOneEnvelopeSchema.safeParse(json);
        const legacySource = versionOneEnvelope.success
          ? versionOneEnvelope.data.pizzas
          : json;
        const migrated = migrateWithSchema(legacySource, legacyPizzaSchema);

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
      return storage !== null && storageWritable && !blockedByUnknownVersion;
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
