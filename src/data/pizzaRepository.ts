import demoPizzas from "../demoPizzas";
import { pizzaListSchema, type Pizza } from "../models/Pizza";

const STORAGE_KEY = "pizzasState";
const cloneDemoPizzas = (): Pizza[] => demoPizzas.map((pizza) => ({ ...pizza }));

export const pizzaRepository = {
  load(): Pizza[] {
    if (typeof window === "undefined") return cloneDemoPizzas();

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return cloneDemoPizzas();

      const parsedJson: unknown = JSON.parse(raw);
      const parsedPizzas = pizzaListSchema.safeParse(parsedJson);

      if (!parsedPizzas.success) {
        window.localStorage.removeItem(STORAGE_KEY);
        return cloneDemoPizzas();
      }

      return parsedPizzas.data;
    } catch {
      return cloneDemoPizzas();
    }
  },

  save(pizzas: Pizza[]): boolean {
    if (typeof window === "undefined") return false;
    const validatedPizzas = pizzaListSchema.parse(pizzas);

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(validatedPizzas));
      return true;
    } catch {
      return false;
    }
  },

  clear(): void {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Storage can be unavailable in restricted browser contexts.
    }
  },
};
