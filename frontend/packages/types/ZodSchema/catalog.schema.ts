import { z } from "zod";

export const ProductItemSchema = z
  .object({
    id: z.number().int().positive(),
    name: z.string().min(1),
    category: z.string().min(1),
    description: z.string(),
    price: z.number().nonnegative(),
  })
  .strict();

export type ProductItem = z.infer<typeof ProductItemSchema>;

export const CategorySchema = z
  .object({
    key: z.string().min(1),
    label: z.string().min(1),
  })
  .strict();

export type Category = z.infer<typeof CategorySchema>;
