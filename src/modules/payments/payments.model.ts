import { z } from "zod";
import type { UnwrapSchema } from "elysia";

export const checkoutBodySchema = z.object({
  order_id: z.string().trim(),
  method: z.enum(["cash", "card", "mobile_wallet", "others"]),
  customer: z
    .object({
      name: z.string().trim().optional(),
      phone: z.string().trim().optional(),
    })
    .optional(),
  discount_type: z.enum(["percentage", "fixed"]).optional(),
  discount_value: z.number().optional(),
  tax_type: z.enum(["percentage", "fixed"]).optional(),
  tax_value: z.number().optional(),
  notes: z.string().trim().optional(),
});

export type CheckoutBody = z.infer<typeof checkoutBodySchema>;

export const historyQuerySchema = z.object({
  startDate: z.string().trim().optional(),
  endDate: z.string().trim().optional(),
  limit: z.coerce.number().min(1).optional(),
  offset: z.coerce.number().min(0).optional(),
});

export type HistoryQuery = z.infer<typeof historyQuerySchema>;

export const PaymentsModel = {
  checkoutBody: checkoutBodySchema,
  historyQuery: historyQuerySchema,
};

export type PaymentsModel = {
  [k in keyof typeof PaymentsModel]: UnwrapSchema<(typeof PaymentsModel)[k]>;
};
