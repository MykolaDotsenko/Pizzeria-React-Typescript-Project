import type { Pizza } from "./pizza";

export const seedPizzas: readonly Pizza[] = [
  { id: "1", name: "Pepperoni", priceCents: 800, image: "pizza-1.jpg" },
  { id: "2", name: "Margherita", priceCents: 900, image: "pizza-2.jpg" },
  { id: "3", name: "Sausage", priceCents: 1100, image: "pizza-3.jpg" },
  { id: "4", name: "Four Cheese", priceCents: 1000, image: "pizza-4.jpg" },
  { id: "5", name: "Veggie", priceCents: 1200, image: "pizza-5.jpg" },
  { id: "6", name: "Mixed", priceCents: 800, image: "pizza-6.jpg" },
];
