import { t } from "elysia";

export const checkoutBodySchema = t.Object({
  order_id: t.String(),
  method: t.Union([
    t.Literal("cash"),
    t.Literal("card"),
    t.Literal("mobile_wallet"),
    t.Literal("other"),
  ]),
  customer: t.Optional(
    t.Object({
      name: t.Optional(t.String()),
      phone: t.Optional(t.String()),
    })
  ),
  discount_type: t.Optional(
    t.Union([t.Literal("percentage"), t.Literal("fixed")])
  ),
  discount_value: t.Optional(t.Number()),
  tax_type: t.Optional(
    t.Union([t.Literal("percentage"), t.Literal("fixed")])
  ),
  tax_value: t.Optional(t.Number()),
  notes: t.Optional(t.String()),
});

export type CheckoutBody = typeof checkoutBodySchema.static;

export const historyQuerySchema = t.Object({
  startDate: t.Optional(t.String()),
  endDate: t.Optional(t.String()),
  limit: t.Optional(t.Numeric()),
  offset: t.Optional(t.Numeric()),
});

export type HistoryQuery = typeof historyQuerySchema.static;
