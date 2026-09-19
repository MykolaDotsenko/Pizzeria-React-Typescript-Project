import { z } from "zod";
import demoPizzas from "../demoPizzas";
import {
  legacyPizzaSchema,
  pizzaListSchema,
  type Pizza,
} from "../models/Pizza";

const STORAGE_KEY = "pizzasState";
const STORAGE_VERSION = 1;

const persistedStateSchema = z.object({
  version: z.literal(STORAGE_VERSION),
  pizzas: z.unknown(),
});

const cloneDemoPizzas = (): Pizza[] =>
  demoPizzas.map((pizza) => ({ ...pizza }));

const removeStoredPizzas = () => {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage can be unavailable in restricted browser contexts.
  }
};

const normalizePizzaList = (value: unknown): Pizza[] | null => {
  if (!Array.isArray(value)) {
    return null;
  }

  if (value.length === 0) {
    return [];
  }

  const normalized: Pizza[] = [];
  const seenIds = new Set<number>();

  for (const item of value) {
    const parsed = legacyPizzaSchema.safeParse(item);

    if (!parsed.success || seenIds.has(parsed.data.id)) {
      continue;
    }

    seenIds.add(parsed.data.id);
    normalized.push(parsed.data);
  }

  return normalized.length > 0 ? normalized : null;
};

export const pizzaRepository = {
  load(): Pizza[] {
    if (typeof window === "undefined") {
      return cloneDemoPizzas();
    }

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);

      if (!raw) {
        return cloneDemoPizzas();
      }

      const parsedJson: unknown = JSON.parse(raw);
      const envelope = persistedStateSchema.safeParse(parsedJson);
      const source = envelope.success ? envelope.data.pizzas : parsedJson;
      const normalized = normalizePizzaList(source);

      if (normalized === null) {
        removeStoredPizzas();
        return cloneDemoPizzas();
      }

      const alreadyCurrent =
        envelope.success && pizzaListSchema.safeParse(source).success;

      if (!alreadyCurrent) {
        this.save(normalized);
      }

      return normalized;
    } catch {
      removeStoredPizzas();
      return cloneDemoPizzas();
    }
  },

  save(pizzas: Pizza[]): boolean {
    if (typeof window === "undefined") {
      return false;
    }

    const validatedPizzas = pizzaListSchema.safeParse(pizzas);

    if (!validatedPizzas.success) {
      return false;
    }

    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          version: STORAGE_VERSION,
          pizzas: validatedPizzas.data,
        })
      );
      return true;
    } catch {
      return false;
    }
  },

  clear(): void {
    if (typeof window === "undefined") {
      return;
    }

    removeStoredPizzas();
  },
};
