import type { Pizza } from "./pizza";

export type PizzaAction =
  | { type: "pizza/added"; pizza: Pizza }
  | { type: "pizza/updated"; pizza: Pizza }
  | { type: "pizza/deleted"; id: string };

export function pizzaReducer(
  state: readonly Pizza[],
  action: PizzaAction,
): readonly Pizza[] {
  switch (action.type) {
    case "pizza/added":
      return state.some((pizza) => pizza.id === action.pizza.id)
        ? state
        : [...state, action.pizza];

    case "pizza/updated":
      if (!state.some((pizza) => pizza.id === action.pizza.id)) {
        return state;
      }
      return state.map((pizza) =>
        pizza.id === action.pizza.id ? action.pizza : pizza,
      );

    case "pizza/deleted":
      return state.some((pizza) => pizza.id === action.id)
        ? state.filter((pizza) => pizza.id !== action.id)
        : state;
  }
}
