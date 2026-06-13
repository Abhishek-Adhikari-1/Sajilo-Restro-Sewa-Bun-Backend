import { type UnwrapSchema } from "elysia";
import { z } from "zod";

export const createMenuSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1)
    .toLowerCase()
    .transform((name) => name.charAt(0).toUpperCase() + name.slice(1)),
  description: z
    .string()
    .trim()
    .toLowerCase()
    .transform(
      (description) =>
        description.charAt(0).toUpperCase() + description.slice(1),
    )
    .optional(),
  price: z.number().int().positive(),
  estimatedPreparationTime: z.number().int().positive().optional(),
  imageId: z.string().trim().optional(),
  categoryId: z.string().trim(),
  isAvailable: z.boolean().optional().default(true),
});

export const updateMenuSchema = z.object({
  name: z
    .string()
    .min(1)
    .toLowerCase()
    .transform((name) => name.charAt(0).toUpperCase() + name.slice(1))
    .optional(),
  description: z
    .string()
    .trim()
    .toLowerCase()
    .transform(
      (description) =>
        description.charAt(0).toUpperCase() + description.slice(1),
    )
    .optional(),
  price: z.number().int().positive().optional(),
  estimatedPreparationTime: z.number().int().positive().optional(),
  imageId: z.string().trim().optional(),
  categoryId: z.string().trim().optional(),
  isAvailable: z.boolean().optional(),
});

export const updateMenuStatusSchema = z.object({
  isAvailable: z.boolean(),
});

export const getAllMenusQuerySchema = z.object({
  categoryId: z.string().optional(),
  isAvailable: z.preprocess((val) => {
    if (typeof val !== "string") return val;

    const normalized = val.toLowerCase().trim();

    if (["true", "1", "yes"].includes(normalized)) return true;
    if (["false", "0", "no"].includes(normalized)) return false;

    return undefined;
  }, z.boolean().optional()),
  limit: z.coerce.number().min(1).max(100).optional().default(25),
  offset: z.coerce.number().min(0).optional().default(0),
  search: z.string().trim().optional(),
});

export const MenusModel = {
  createMenuBody: createMenuSchema,
  updateMenuBody: updateMenuSchema,
  updateStatusBody: updateMenuStatusSchema,
  getAllMenusQuery: getAllMenusQuerySchema,
};

export type MenusModel = {
  [k in keyof typeof MenusModel]: UnwrapSchema<(typeof MenusModel)[k]>;
};
