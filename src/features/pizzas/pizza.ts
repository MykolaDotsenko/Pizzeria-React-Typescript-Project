import { z } from "zod";

export const PIZZA_IMAGE_VALUES = [
  "pizza-1.jpg",
  "pizza-2.jpg",
  "pizza-3.jpg",
  "pizza-4.jpg",
  "pizza-5.jpg",
  "pizza-6.jpg",
] as const;

export const PIZZA_IMAGE_OPTIONS = [
  { value: PIZZA_IMAGE_VALUES[0], label: "Pepperoni" },
  { value: PIZZA_IMAGE_VALUES[1], label: "Margherita" },
  { value: PIZZA_IMAGE_VALUES[2], label: "Sausage" },
  { value: PIZZA_IMAGE_VALUES[3], label: "Four cheese" },
  { value: PIZZA_IMAGE_VALUES[4], label: "Vegetable" },
  { value: PIZZA_IMAGE_VALUES[5], label: "Mixed" },
] as const;

export const PIZZA_CATEGORY_VALUES = [
  "classic",
  "vegetarian",
  "spicy",
  "special",
] as const;

export const PIZZA_CATEGORY_OPTIONS = [
  { value: PIZZA_CATEGORY_VALUES[0], label: "Classic" },
  { value: PIZZA_CATEGORY_VALUES[1], label: "Vegetarian" },
  { value: PIZZA_CATEGORY_VALUES[2], label: "Spicy" },
  { value: PIZZA_CATEGORY_VALUES[3], label: "Special" },
] as const;

export const MAX_UPLOADED_IMAGE_DATA_URL_LENGTH = 420_000;

export const pizzaPresetImageSchema = z.object({
  kind: z.literal("preset"),
  value: z.enum(PIZZA_IMAGE_VALUES),
});

export const pizzaUploadedImageSchema = z.object({
  kind: z.literal("uploaded"),
  dataUrl: z
    .string()
    .max(MAX_UPLOADED_IMAGE_DATA_URL_LENGTH, {
      error: "Uploaded photo is too large",
    })
    .regex(/^data:image\/jpeg;base64,/i, {
      error: "Uploaded photo must be a processed JPEG image",
    }),
});

export const pizzaImageSchema = z.discriminatedUnion("kind", [
  pizzaPresetImageSchema,
  pizzaUploadedImageSchema,
]);

export const pizzaCategorySchema = z.enum(PIZZA_CATEGORY_VALUES);

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

export const pizzaDescriptionSchema = z
  .string()
  .trim()
  .min(10, { error: "Description must be at least 10 characters" })
  .max(240, { error: "Description must be 240 characters or fewer" });

export const priceCentsSchema = z
  .number()
  .int({ error: "Price must use whole cents" })
  .min(1, { error: "Price must be at least €0.01" })
  .max(100_000, { error: "Price must not exceed €1,000" });

export const pizzaSchema = z.object({
  id: pizzaIdSchema,
  name: pizzaNameSchema,
  description: pizzaDescriptionSchema,
  category: pizzaCategorySchema,
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
    description: pizzaDescriptionSchema,
    category: pizzaCategorySchema,
    price: priceInputSchema,
    image: pizzaImageSchema,
  })
  .transform(({ name, description, category, price, image }) => ({
    name,
    description,
    category,
    priceCents: price,
    image,
  }));

export type Pizza = z.infer<typeof pizzaSchema>;
export type PizzaDraft = Omit<Pizza, "id">;
export type PizzaImage = z.infer<typeof pizzaImageSchema>;
export type PizzaCategory = z.infer<typeof pizzaCategorySchema>;
export type PizzaPresetImage = z.infer<typeof pizzaPresetImageSchema>;

export interface PizzaFormValues {
  name: string;
  description: string;
  category: PizzaCategory;
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

export function getPizzaCategoryLabel(category: PizzaCategory): string {
  return (
    PIZZA_CATEGORY_OPTIONS.find((option) => option.value === category)?.label ??
    category
  );
}

export function createPresetPizzaImage(value: PizzaPresetImage["value"]): PizzaImage {
  return { kind: "preset", value };
}

export function pizzaToFormValues(pizza: Pizza): PizzaFormValues {
  return {
    name: pizza.name,
    description: pizza.description,
    category: pizza.category,
    price: (pizza.priceCents / 100).toFixed(2),
    image: pizza.image,
  };
}

export function createPizzaId(): string {
  return globalThis.crypto.randomUUID();
}

export function getPizzaImageUrl(image: PizzaImage): string {
  return image.kind === "uploaded"
    ? image.dataUrl
    : `${import.meta.env.BASE_URL}images/${image.value}`;
}
