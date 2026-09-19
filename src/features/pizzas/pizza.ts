import { z } from "zod";

export const PIZZA_IMAGE_OPTIONS = [
  { value: "pizza-1.jpg", label: "Pepperoni" },
  { value: "pizza-2.jpg", label: "Margherita" },
  { value: "pizza-3.jpg", label: "Sausage" },
  { value: "pizza-4.jpg", label: "Four cheese" },
  { value: "pizza-5.jpg", label: "Vegetable" },
  { value: "pizza-6.jpg", label: "Mixed" },
] as const;

const imageNames = PIZZA_IMAGE_OPTIONS.map((option) => option.value) as [
  string,
  ...string[],
];

export const pizzaImageSchema = z.enum(imageNames);

export const pizzaIdSchema = z
  .string()
  .trim()
  .min(1, { error: "Pizza id is required" })
  .max(100, { error: "Pizza id is too long" })
  .regex(/^[A-Za-z0-9_-]+$/, { error: "Pizza id contains invalid characters" });

export const pizzaNameSchema = z
  .string()
  .trim()
  .min(2, { error: "Name must be at least 2 characters" })
  .max(80, { error: "Name must be 80 characters or fewer" });

export const priceCentsSchema = z
  .number()
  .int({ error: "Price must use whole cents" })
  .min(1, { error: "Price must be at least €0.01" })
  .max(100_000, { error: "Price must not exceed €1,000" });

export const pizzaSchema = z.object({
  id: pizzaIdSchema,
  name: pizzaNameSchema,
  priceCents: priceCentsSchema,
  image: pizzaImageSchema,
});

export const pizzaListSchema = z
  .array(pizzaSchema)
  .refine((pizzas) => new Set(pizzas.map((pizza) => pizza.id)).size === pizzas.length, {
    error: "Pizza ids must be unique",
  });

const priceInputSchema = z
  .string()
  .trim()
  .min(1, { error: "Enter a price" })
  .regex(/^\d{1,4}(?:[.,]\d{1,2})?$/, {
    error: "Use a valid amount with at most 2 decimal places",
  })
  .transform((value) => Math.round(Number(value.replace(",", ".")) * 100))
  .pipe(priceCentsSchema);

export const pizzaFormSchema = z
  .object({
    name: pizzaNameSchema,
    price: priceInputSchema,
    image: pizzaImageSchema,
  })
  .transform(({ name, price, image }) => ({
    name,
    priceCents: price,
    image,
  }));

export type Pizza = z.infer<typeof pizzaSchema>;
export type PizzaDraft = Omit<Pizza, "id">;
export type PizzaImage = z.infer<typeof pizzaImageSchema>;

export interface PizzaFormValues {
  name: string;
  price: string;
  image: PizzaImage;
}

const euroFormatter = new Intl.NumberFormat("en-FI", {
  style: "currency",
  currency: "EUR",
});

export function formatPizzaPrice(priceCents: number): string {
  return euroFormatter.format(priceCents / 100);
}

export function pizzaToFormValues(pizza: Pizza): PizzaFormValues {
  return {
    name: pizza.name,
    price: (pizza.priceCents / 100).toFixed(2),
    image: pizza.image,
  };
}

export function createPizzaId(): string {
  return globalThis.crypto.randomUUID();
}

export function getPizzaImageUrl(image: PizzaImage): string {
  return `${import.meta.env.BASE_URL}images/${image}`;
}
