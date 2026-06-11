import { type UnwrapSchema } from "elysia";
import { z } from "zod";
import { tableStatusEnum } from "../../db";

export const updateTableStatusSchema = z.object({
  status: z.enum(tableStatusEnum.enumValues),
});

export const createTableSchema = z.object({
  tableNumber: z.number().int().positive(),
  section: z.string().min(1),
  capacity: z.number().int().positive(),
  status: z.enum(tableStatusEnum.enumValues).optional(),
});

export const updateTableSchema = z.object({
  tableNumber: z.number().int().positive().optional(),
  section: z.string().min(1).optional(),
  capacity: z.number().int().positive().optional(),
  status: z.enum(tableStatusEnum.enumValues).optional(),
});

export const getAllTablesQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(100).optional().default(20),
  offset: z.coerce.number().min(0).optional().default(0),
  status: z.enum(tableStatusEnum.enumValues).optional(),
});

export const TablesModel = {
  createTableBody: createTableSchema,
  updateTableBody: updateTableSchema,
  updateStatusBody: updateTableStatusSchema,
  getAllTablesQuery: getAllTablesQuerySchema,
};

export type TablesModel = {
  [k in keyof typeof TablesModel]: UnwrapSchema<(typeof TablesModel)[k]>;
};
