import { eq, sql, and, gte, lte, desc } from "drizzle-orm";
import { db, type TX } from "../../config/db";
import {
  payments,
  orders,
  orderItems,
  customers,
  tables,
} from "../../db/index";
import type { CheckoutBody, HistoryQuery } from "./payments.model";

import { users, images } from "../../db/index";

export class PaymentsRepo {
  private static conn(tx?: TX) {
    return tx ?? db;
  }

  static async getHistory(query: HistoryQuery, tx?: TX) {
    const { startDate, endDate, limit = 50, offset = 0 } = query;
    
    const conditions = [];
    if (startDate) conditions.push(gte(payments.createdAt, new Date(startDate)));
    if (endDate) conditions.push(lte(payments.createdAt, new Date(endDate)));

    const results = await this.conn(tx).select({
        payment: payments,
        createdByName: sql<string>`${users.firstName} || ' ' || ${users.lastName}`,
        createdByImage: images.secureUrl,
    })
      .from(payments)
      .leftJoin(users, eq(payments.createdBy, users.id))
      .leftJoin(images, eq(users.imageId, images.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .limit(Number(limit))
      .offset(Number(offset))
      .orderBy(desc(payments.createdAt));

    const [{ count }] = await this.conn(tx).select({ count: sql`count(*)`.mapWith(Number) })
      .from(payments)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    return { data: results, total: count };
  }

  static async checkout(
    data: CheckoutBody,
    processedBy: string,
    tx?: TX
  ) {
    return await this.conn(tx).transaction(async (trx) => {
      // 1. Fetch the order
      const [order] = await trx.select().from(orders).where(eq(orders.id, data.order_id));
      if (!order) {
        throw new Error("Order not found");
      }
      if (order.status === "cancelled") {
        throw new Error(`Order is already cancelled`);
      }

      const [existingPayment] = await trx.select().from(payments).where(eq(payments.orderId, data.order_id));
      if (existingPayment) {
        throw new Error("Order has already been paid for");
      }

      // 2. Calculate subtotal
      const items = await trx.select().from(orderItems).where(eq(orderItems.orderId, data.order_id));
      const activeItems = items.filter((i) => i.status !== "cancelled");
      const subtotal = activeItems.reduce((acc, item) => acc + item.priceAtTime * item.quantity, 0);

      // 3. Handle Customer details
      let customerId: string | null = null;
      if (data.customer?.name || data.customer?.phone) {
        const phoneToSearch = data.customer.phone || null;
        if (phoneToSearch) {
          const [existingCustomer] = await trx
            .select()
            .from(customers)
            .where(eq(customers.phone, phoneToSearch));
          if (existingCustomer) {
            customerId = existingCustomer.id;
          }
        }
        
        if (!customerId) {
          const [newCustomer] = await trx
            .insert(customers)
            .values({
              name: data.customer.name || "Anonymous",
              phone: data.customer.phone || undefined,
            })
            .returning();
          customerId = newCustomer.id;
        }
      }

      // 4. Calculate total amount
      let totalAmount = subtotal;

      // Validate inputs
      if (data.discount_value !== undefined && data.discount_value !== null) {
        if (data.discount_value < 0) {
          throw new Error("Discount cannot be negative");
        }
        if (data.discount_type === "percentage" && data.discount_value > 100) {
          throw new Error("Percentage discount cannot exceed 100%");
        }
        if (data.discount_type === "fixed" && data.discount_value > subtotal) {
          throw new Error("Fixed discount cannot exceed the subtotal");
        }
      }

      if (data.tax_value !== undefined && data.tax_value !== null) {
        if (data.tax_value < 0) {
          throw new Error("Tax cannot be negative");
        }
        if (data.tax_type === "percentage" && data.tax_value > 100) {
          throw new Error("Percentage tax cannot exceed 100%");
        }
      }

      if (data.discount_value) {
        if (data.discount_type === "percentage") {
          totalAmount -= (subtotal * data.discount_value) / 100;
        } else {
          totalAmount -= data.discount_value;
        }
      }
      
      if (data.tax_value) {
        if (data.tax_type === "percentage") {
          totalAmount += (totalAmount * data.tax_value) / 100;
        } else {
          totalAmount += data.tax_value;
        }
      }

      if (totalAmount < 0) {
        throw new Error("Total amount cannot be negative");
      }

      // 5. Create Payment Record
      const [payment] = await trx
        .insert(payments)
        .values({
          orderId: data.order_id,
          customerId: customerId,
          subtotal: Math.round(subtotal),
          totalAmount: Math.round(totalAmount),
          method: data.method,
          status: "paid",
          discountType: data.discount_type,
          discountValue: data.discount_value,
          taxType: data.tax_type,
          taxValue: data.tax_value,
          notes: data.notes,
          createdBy: processedBy,
        })
        .returning();

      // 6. Update order status to completed
      await trx
        .update(orders)
        .set({ status: "completed", updatedAt: new Date() })
        .where(eq(orders.id, data.order_id));

      // 7. Update table status ONLY if it wasn't already completed
      if (order.status !== "completed") {
        const [table] = await trx.select().from(tables).where(eq(tables.id, order.tableId));
        if (table) {
          // If the order was already marked as 'billing', its seats were already freed!
          const shouldFreeSeats = order.status !== "billing";
          const newOccupiedSeats = shouldFreeSeats 
              ? Math.max(0, table.occupiedSeats - order.guestsCount)
              : table.occupiedSeats;
              
          const newStatus = newOccupiedSeats >= table.capacity ? "occupied" : "available";

          await trx
            .update(tables)
            .set({
              activeOrders: sql`array_remove(active_orders, ${data.order_id}::varchar)`,
              occupiedSeats: newOccupiedSeats,
              status: newStatus,
            })
            .where(eq(tables.id, order.tableId));
        }
      }

      return payment;
    });
  }
}
