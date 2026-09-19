import { createPresetPizzaImage, type Pizza } from "./pizza";

export const seedPizzas: readonly Pizza[] = [
  {
    id: "1",
    name: "Pepperoni",
    description: "Tomato, mozzarella, pepperoni, and a crisp oregano finish.",
    category: "classic",
    priceCents: 800,
    image: createPresetPizzaImage("pizza-1.jpg"),
  },
  {
    id: "2",
    name: "Margherita",
    description: "Tomato, mozzarella, basil, and extra virgin olive oil.",
    category: "vegetarian",
    priceCents: 900,
    image: createPresetPizzaImage("pizza-2.jpg"),
  },
  {
    id: "3",
    name: "Sausage",
    description: "Savory sausage, mozzarella, tomato, and roasted herbs.",
    category: "classic",
    priceCents: 1100,
    image: createPresetPizzaImage("pizza-3.jpg"),
  },
  {
    id: "4",
    name: "Four Cheese",
    description: "A rich blend of mozzarella, cheddar, blue cheese, and parmesan.",
    category: "vegetarian",
    priceCents: 1000,
    image: createPresetPizzaImage("pizza-4.jpg"),
  },
  {
    id: "5",
    name: "Veggie",
    description: "Seasonal vegetables, tomato, mozzarella, and fresh herbs.",
    category: "vegetarian",
    priceCents: 1200,
    image: createPresetPizzaImage("pizza-5.jpg"),
  },
  {
    id: "6",
    name: "Mixed",
    description: "A house combination of meats, vegetables, mozzarella, and tomato.",
    category: "special",
    priceCents: 800,
    image: createPresetPizzaImage("pizza-6.jpg"),
  },
];
