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

export const pizzaSchema = z.object({
  id: z.number().int().positive(),
  title: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
  price: z.number().finite().positive("Price must be greater than 0").max(1000, "Price is too high"),
  img: pizzaImageSchema,
});

export const pizzaInputSchema = pizzaSchema.omit({ id: true });
export const pizzaListSchema = z.array(pizzaSchema);

export type Pizza = z.infer<typeof pizzaSchema>;
export type PizzaInput = z.infer<typeof pizzaInputSchema>;
export type PizzaImage = z.infer<typeof pizzaImageSchema>;
