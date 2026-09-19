import { z } from "zod";

export const PIZZA_IMAGES = [
  "pizza-1.jpg",
  "pizza-2.jpg",
  "pizza-3.jpg",
  "pizza-4.jpg",
  "pizza-5.jpg",
  "pizza-6.jpg",
] as const;

export const pizzaImageSchema = z.enum(PIZZA_IMAGES);
export const pizzaTitleSchema = z
  .string()
  .trim()
  .min(2, "Name must be at least 2 characters")
  .max(80, "Name must be 80 characters or fewer");

export const pizzaPriceSchema = z
  .number()
  .finite()
  .min(0.01, "Price must be at least 0.01")
  .max(1000, "Price is too high")
  .refine(
    (value) => Number(value.toFixed(2)) === value,
    "Price can have at most 2 decimal places"
  );

export const pizzaIdSchema = z
  .number()
  .int()
  .positive()
  .max(Number.MAX_SAFE_INTEGER, "Pizza id is too large");

export const pizzaSchema = z.object({
  id: pizzaIdSchema,
  title: pizzaTitleSchema,
  price: pizzaPriceSchema,
  img: pizzaImageSchema,
});

export const pizzaInputSchema = pizzaSchema.omit({ id: true });

export const pizzaListSchema = z.array(pizzaSchema).superRefine((pizzas, ctx) => {
  const seenIds = new Set<number>();

  pizzas.forEach((pizza, index) => {
    if (seenIds.has(pizza.id)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Pizza ids must be unique",
        path: [index, "id"],
      });
      return;
    }

    seenIds.add(pizza.id);
  });
});

const legacyPriceSchema = z
  .union([z.number(), z.string().trim().min(1)])
  .transform((value) => (typeof value === "number" ? value : Number(value)))
  .pipe(pizzaPriceSchema);

export const legacyPizzaSchema = z.object({
  id: z.coerce
    .number()
    .int()
    .positive()
    .max(Number.MAX_SAFE_INTEGER, "Pizza id is too large"),
  title: pizzaTitleSchema,
  price: legacyPriceSchema,
  img: pizzaImageSchema,
});

export type Pizza = z.infer<typeof pizzaSchema>;
export type PizzaInput = z.infer<typeof pizzaInputSchema>;
export type PizzaImage = z.infer<typeof pizzaImageSchema>;
