import { z } from "zod";
import { orderItemStatusEnum, orderStatusEnum } from "../../db";
import type { UnwrapSchema } from "elysia";

export const orderItemSchema = z.object({
  id: z.string().trim(),
  quantity: z.number().int().positive(),
  special_instructions: z.string().trim().nullable().optional(),
  status: z.enum(orderItemStatusEnum.enumValues).optional(),
});

export const createOrderSchema = z.object({
  table_id: z.string().trim(),
  guests_count: z.number().int().positive(),
  notes: z.string().trim().nullable().optional(),
  items: z.array(orderItemSchema).min(1),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(orderStatusEnum.enumValues),
});

export const updateItemStatusSchema = z.object({
  status: z.enum(orderItemStatusEnum.enumValues),
});

export const OrdersModel = {
  createOrderBody: createOrderSchema,
  updateOrderStatusBody: updateOrderStatusSchema,
  updateItemStatusBody: updateItemStatusSchema,
};

export type OrdersModel = {
  [k in keyof typeof OrdersModel]: UnwrapSchema<(typeof OrdersModel)[k]>;
};

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type UpdateItemStatusInput = z.infer<typeof updateItemStatusSchema>;
