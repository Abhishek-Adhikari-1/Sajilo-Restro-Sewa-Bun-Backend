import { eq, sql, inArray, and, notExists } from "drizzle-orm";
import { db, type TX } from "../../config/db";
import {
  orders,
  orderItems,
  tables,
  menus,
  orderStatusEnum,
  orderItemStatusEnum,
} from "../../db/index";

type OrderStatus = typeof orderStatusEnum.enumValues[number];
type OrderItemStatus = typeof orderItemStatusEnum.enumValues[number];

export interface AddOrderItemInput {
  id: string; // Menu ID
  quantity: number;
  special_instructions?: string | null;
  status?: string;
}

export abstract class OrdersRepo {
  private static conn(tx?: TX) {
    return tx ?? db;
  }

  static async getOrderById(id: string, tx?: TX) {
    const [order] = await this.conn(tx).query.orders.findMany({
      where: (o, { eq }) => eq(o.id, id),
      with: {
        table: true,
        createdByUser: {
          with: {
            avatar: true,
          },
        },
        items: {
          with: {
            menu: true,
          },
        },
      },
    });
    return order || null;
  }

  static async createOrder(
    data: { table_id: string; created_by: string; guests_count: number; notes?: string | null; items: AddOrderItemInput[] },
    tx?: TX,
  ) {
    return await this.conn(tx).transaction(async (trx) => {
      // 0. Fetch table first to validate
      const [table] = await trx.select().from(tables).where(eq(tables.id, data.table_id));
      if (!table) throw new Error("Table not found");
      if (table.status === "reserved") throw new Error("Cannot create order: Table is reserved");

      // 1. Create the main order
      const [newOrder] = await trx
        .insert(orders)
        .values({
          tableId: data.table_id,
          createdBy: data.created_by,
          guestsCount: data.guests_count,
          notes: data.notes ?? null,
          status: "pending",
        })
        .returning();

      if (!newOrder) throw new Error("Failed to create order");

      // 2. Fetch current prices for all menu items
      const menuIds = data.items.map((i) => i.id);
      const menuRecords = await trx
        .select({ id: menus.id, price: menus.price })
        .from(menus)
        .where(inArray(menus.id, menuIds));

      const priceMap = new Map(menuRecords.map((m) => [m.id, m.price]));

      // 3. Prepare order items
      const itemsToInsert = data.items.map((item) => {
        const price = priceMap.get(item.id);
        if (price === undefined) {
          throw new Error(`Menu item not found: ${item.id}`);
        }
        return {
          orderId: newOrder.id,
          menuId: item.id,
          quantity: item.quantity,
          notes: item.special_instructions ?? null,
          priceAtTime: price,
          status: "pending" as const,
        };
      });

      // 4. Bulk insert items
      const insertedItems = await trx
        .insert(orderItems)
        .values(itemsToInsert)
        .returning();

      // 5. Update the table status and activeOrders array
      const newOccupiedSeats = table.occupiedSeats + data.guests_count;
      let newStatus: any = newOccupiedSeats >= table.capacity ? "occupied" : "available";
      if (table.status === "reserved") newStatus = "reserved";

      await trx
        .update(tables)
        .set({
          status: newStatus,
          occupiedSeats: newOccupiedSeats,
          activeOrders: sql`array_append(active_orders, ${newOrder.id})`,
        })
        .where(eq(tables.id, data.table_id));

      // Map the returned objects
      const items = insertedItems.map((item) => {
        return {
          id: item.id,
          name: "Unknown", 
          price: item.priceAtTime,
          quantity: item.quantity,
          special_instructions: item.notes,
          status: item.status,
        };
      });

      return {
        id: newOrder.id,
        table_id: newOrder.tableId,
        table_number: table.tableNumber,
        status: newOrder.status,
        items,
        notes: newOrder.notes,
        guests_count: newOrder.guestsCount,
        created_by: newOrder.createdBy,
        created_at: newOrder.createdAt,
        updated_at: newOrder.updatedAt,
      };
    });
  }

  static async findActiveOrders(tx?: TX) {
    const records = await this.conn(tx).query.orders.findMany({
      where: (orders, { notInArray }) =>
        notInArray(orders.status, ["completed", "cancelled"]),
      with: {
        table: true,
      },
    });

    const orderIds = records.map((r) => r.id);
    let allItems: {
      id: string;
      orderId: string;
      menuId: string;
      quantity: number;
      priceAtTime: number;
      notes: string | null;
      status: OrderItemStatus;
      createdAt: Date;
      updatedAt: Date;
      menu: { name: string } | null;
    }[] = [];
    if (orderIds.length > 0) {
      allItems = await this.conn(tx).query.orderItems.findMany({
        where: (orderItems, { inArray }) => inArray(orderItems.orderId, orderIds),
        with: {
          menu: true,
        },
      });
    }

    return records.map((order) => {
      const orderItemsList = allItems.filter((i) => i.orderId === order.id);

      const items = orderItemsList.map((item) => ({
        id: item.id,
        name: item.menu?.name ?? "Unknown",
        price: item.priceAtTime,
        quantity: item.quantity,
        special_instructions: item.notes,
        status: item.status,
      }));

      return {
        id: order.id,
        table_id: order.tableId,
        table_number: order.table?.tableNumber,
        status: order.status,
        items,
        notes: order.notes,
        guests_count: order.guestsCount,
        created_by: order.createdBy,
        created_at: order.createdAt,
        updated_at: order.updatedAt,
      };
    });
  }

  static async findUnpaidOrders() {
    // We import payments dynamically to avoid circular dependencies if any
    const { payments } = await import("../../db/schema/payment.schema");

    const activeOrdersRaw = await this.conn().query.orders.findMany({
      where: (orders, { inArray, and, notExists }) => 
        and(
          inArray(orders.status, ["served", "billing", "completed"]),
          notExists(
            this.conn().select().from(payments).where(eq(payments.orderId, orders.id))
          )
        ),
      with: {
        table: true,
      },
      orderBy: (orders, { desc }) => [desc(orders.createdAt)],
    });

    if (activeOrdersRaw.length === 0) return [];

    const orderIds = activeOrdersRaw.map((o) => o.id);

    const allItems = await this.conn().query.orderItems.findMany({
      where: (orderItems, { inArray }) => inArray(orderItems.orderId, orderIds),
      with: { menu: true },
    });

    return activeOrdersRaw.map((order) => {
      const orderItemsList = allItems.filter((i) => i.orderId === order.id);

      const items = orderItemsList.map((item) => ({
        id: item.id,
        name: item.menu?.name ?? "Unknown",
        price: item.priceAtTime,
        quantity: item.quantity,
        special_instructions: item.notes,
        status: item.status,
      }));

      return {
        id: order.id,
        table_id: order.tableId,
        table_number: order.table?.tableNumber,
        status: order.status,
        items,
        notes: order.notes,
        guests_count: order.guestsCount,
        created_by: order.createdBy,
        created_at: order.createdAt,
        updated_at: order.updatedAt,
      };
    });
  }

  static async updateOrderStatus(tx: TX | undefined, id: string, status: OrderStatus) {
    const [oldOrder] = await this.conn(tx).select().from(orders).where(eq(orders.id, id));
    if (!oldOrder) throw new Error("Order not found");

    const [updatedOrder] = await this.conn(tx)
      .update(orders)
      .set({ status, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();

    if (!updatedOrder) throw new Error("Order not found or update failed");

    const [table] = await this.conn(tx).select().from(tables).where(eq(tables.id, updatedOrder.tableId));

    if (table) {
      let newOccupiedSeats = table.occupiedSeats;
      let shouldRemoveActiveOrder = false;
      let shouldFreeSeats = false;

      // If moving to 'billing', 'completed', or 'cancelled' from a non-freed state
      if ((status === "billing" || status === "completed" || status === "cancelled") && oldOrder.status !== "billing") {
         shouldFreeSeats = true;
      }

      // If moving to 'completed' or 'cancelled', remove from active orders
      if (status === "completed" || status === "cancelled") {
         shouldRemoveActiveOrder = true;
      }

      if (shouldFreeSeats || shouldRemoveActiveOrder) {
         if (shouldFreeSeats) {
           newOccupiedSeats = Math.max(0, table.occupiedSeats - updatedOrder.guestsCount);
         }
         
         let newStatus: any = newOccupiedSeats >= table.capacity ? "occupied" : "available";
         if (table.status === "reserved" && newOccupiedSeats > 0) {
           newStatus = "reserved";
         }

         const activeOrdersUpdate = shouldRemoveActiveOrder 
             ? sql`array_remove(active_orders, ${id}::varchar)`
             : table.activeOrders;

         await this.conn(tx)
          .update(tables)
          .set({
            activeOrders: activeOrdersUpdate,
            occupiedSeats: newOccupiedSeats,
            status: newStatus,
          })
          .where(eq(tables.id, updatedOrder.tableId));
      }
    }

    if (status === "preparing") {
      await this.conn(tx)
        .update(orderItems)
        .set({ status: "preparing", updatedAt: new Date() })
        .where(and(eq(orderItems.orderId, id), eq(orderItems.status, "pending")));
    } else if (status === "ready") {
      await this.conn(tx)
        .update(orderItems)
        .set({ status: "ready", updatedAt: new Date() })
        .where(and(eq(orderItems.orderId, id), inArray(orderItems.status, ["pending", "preparing"])));
    } else if (status === "served") {
      await this.conn(tx)
        .update(orderItems)
        .set({ status: "served", updatedAt: new Date() })
        .where(and(eq(orderItems.orderId, id), inArray(orderItems.status, ["pending", "preparing", "ready"])));
    } else if (status === "cancelled") {
      await this.conn(tx)
        .update(orderItems)
        .set({ status: "cancelled", updatedAt: new Date() })
        .where(and(eq(orderItems.orderId, id), inArray(orderItems.status, ["pending", "preparing", "ready"])));
    }

    const allItemsForOrder = await this.conn(tx).query.orderItems.findMany({
      where: (orderItems, { eq }) => eq(orderItems.orderId, id),
      with: { menu: true },
    });

    return {
      id: updatedOrder.id,
      table_id: updatedOrder.tableId,
      table_number: table?.tableNumber,
      status: updatedOrder.status,
      items: allItemsForOrder.map((item) => ({
        id: item.id,
        name: item.menu?.name ?? "Unknown",
        price: item.priceAtTime,
        quantity: item.quantity,
        special_instructions: item.notes,
        status: item.status,
      })),
      notes: updatedOrder.notes,
      guests_count: updatedOrder.guestsCount,
      created_by: updatedOrder.createdBy,
      created_at: updatedOrder.createdAt,
      updated_at: updatedOrder.updatedAt,
    };
  }

  static async addItemsToOrder(tx: TX | undefined, id: string, items: AddOrderItemInput[]) {
    return await this.conn(tx).transaction(async (trx) => {
      const menuIds = items.map((i) => i.id);
      const menuRecords = await trx
        .select({ id: menus.id, price: menus.price })
        .from(menus)
        .where(inArray(menus.id, menuIds));

      const priceMap = new Map(menuRecords.map((m) => [m.id, m.price]));

      const itemsToInsert = items.map((item) => {
        const price = priceMap.get(item.id);
        if (price === undefined) {
          throw new Error(`Menu item not found: ${item.id}`);
        }
        return {
          orderId: id,
          menuId: item.id,
          quantity: item.quantity,
          notes: item.special_instructions ?? null,
          priceAtTime: price,
          status: "pending" as const,
        };
      });

      await trx
        .insert(orderItems)
        .values(itemsToInsert)
        .returning();

      const [fullOrder] = await trx.select().from(orders).where(eq(orders.id, id));
      if (!fullOrder) throw new Error("Order not found");

      const allItemsForOrder = await trx.query.orderItems.findMany({
        where: (orderItems, { eq }) => eq(orderItems.orderId, id),
        with: { menu: true },
      });

      const [table] = await trx.select().from(tables).where(eq(tables.id, fullOrder.tableId));

      return {
        id: fullOrder.id,
        table_id: fullOrder.tableId,
        table_number: table?.tableNumber,
        status: fullOrder.status,
        items: allItemsForOrder.map((item) => ({
          id: item.id,
          name: item.menu?.name ?? "Unknown",
          price: item.priceAtTime,
          quantity: item.quantity,
          special_instructions: item.notes,
          status: item.status,
        })),
        notes: fullOrder.notes,
        guests_count: fullOrder.guestsCount,
        created_by: fullOrder.createdBy,
        created_at: fullOrder.createdAt,
        updated_at: fullOrder.updatedAt,
      };
    });
  }

  static async updateOrderItems(tx: TX | undefined, id: string, items: AddOrderItemInput[], notes?: string | null) {
    return await this.conn(tx).transaction(async (trx) => {
      // Update order notes if provided
      if (notes !== undefined) {
          await trx.update(orders).set({ notes, updatedAt: new Date() }).where(eq(orders.id, id));
      }

      const incomingIds = items.map(i => i.id);
      
      const directMenus = await trx.select({ id: menus.id, price: menus.price }).from(menus).where(inArray(menus.id, incomingIds));
      const directMenuMap = new Map(directMenus.map(m => [m.id, m.price]));
      
      const existingItems = await trx.select({ id: orderItems.id, menuId: orderItems.menuId }).from(orderItems).where(inArray(orderItems.id, incomingIds));
      const existingItemMap = new Map(existingItems.map(i => [i.id, i.menuId]));
      
      const resolvedMenuIds = [...existingItemMap.values()];
      if (resolvedMenuIds.length > 0) {
         const resolvedMenus = await trx.select({ id: menus.id, price: menus.price }).from(menus).where(inArray(menus.id, resolvedMenuIds));
         for (const rm of resolvedMenus) {
             directMenuMap.set(rm.id, rm.price);
         }
      }

      const itemsToInsert = items
        .filter(item => !item.status || item.status === "pending")
        .map(item => {
          const menuId = existingItemMap.get(item.id) || item.id;
          const price = directMenuMap.get(menuId);
          if (price === undefined) throw new Error(`Menu item not found for ID: ${item.id}`);
          return {
              orderId: id,
              menuId: menuId,
              quantity: item.quantity,
              notes: item.special_instructions ?? null,
              priceAtTime: price,
              status: "pending" as const,
          };
      });

      await trx.delete(orderItems).where(and(eq(orderItems.orderId, id), eq(orderItems.status, "pending")));

      if (itemsToInsert.length > 0) {
          await trx.insert(orderItems).values(itemsToInsert);
      }

      const [fullOrder] = await trx.select().from(orders).where(eq(orders.id, id));
      if (!fullOrder) throw new Error("Order not found");
      const allItemsForOrder = await trx.query.orderItems.findMany({ where: (oi, { eq }) => eq(oi.orderId, id), with: { menu: true } });
      const [table] = await trx.select().from(tables).where(eq(tables.id, fullOrder.tableId));

      return {
        id: fullOrder.id,
        table_id: fullOrder.tableId,
        table_number: table?.tableNumber,
        status: fullOrder.status,
        items: allItemsForOrder.map((item) => ({
          id: item.id,
          name: item.menu?.name ?? "Unknown",
          price: item.priceAtTime,
          quantity: item.quantity,
          special_instructions: item.notes,
          status: item.status,
        })),
        notes: fullOrder.notes,
        guests_count: fullOrder.guestsCount,
        created_by: fullOrder.createdBy,
        created_at: fullOrder.createdAt,
        updated_at: fullOrder.updatedAt,
      };
    });
  }

  static async updateItemStatus(tx: TX | undefined, itemId: string, status: OrderItemStatus) {
    const [updatedItem] = await this.conn(tx)
      .update(orderItems)
      .set({ status, updatedAt: new Date() })
      .where(eq(orderItems.id, itemId))
      .returning();

    if (!updatedItem) throw new Error("Order Item not found");

    const [fullOrder] = await this.conn(tx).select().from(orders).where(eq(orders.id, updatedItem.orderId));
    if (!fullOrder) throw new Error("Order not found");

    const allItemsForOrder = await this.conn(tx).query.orderItems.findMany({
      where: (orderItems, { eq }) => eq(orderItems.orderId, updatedItem.orderId),
      with: { menu: true },
    });

    let newOrderStatus: OrderStatus = fullOrder.status;
    const activeItems = allItemsForOrder.filter(i => i.status !== "cancelled");
    
    if (activeItems.length > 0) {
      const allServed = activeItems.every((i) => i.status === "served");
      const allReadyOrServed = activeItems.every((i) => i.status === "ready" || i.status === "served");
      const anyPreparingOrBeyond = activeItems.some((i) => i.status === "preparing" || i.status === "ready" || i.status === "served");

      if (allServed) {
        newOrderStatus = "served";
      } else if (allReadyOrServed) {
        newOrderStatus = "ready";
      } else if (anyPreparingOrBeyond) {
        newOrderStatus = "preparing";
      } else {
        newOrderStatus = "pending";
      }
    } else {
      newOrderStatus = "cancelled";
    }

    if (newOrderStatus !== fullOrder.status) {
      await this.conn(tx)
        .update(orders)
        .set({ status: newOrderStatus, updatedAt: new Date() })
        .where(eq(orders.id, fullOrder.id));
      fullOrder.status = newOrderStatus;
    }

    const [table] = await this.conn(tx).select().from(tables).where(eq(tables.id, fullOrder.tableId));

    return {
      id: fullOrder.id,
      table_id: fullOrder.tableId,
      table_number: table?.tableNumber,
      status: fullOrder.status,
      items: allItemsForOrder.map((item) => ({
        id: item.id,
        name: item.menu?.name ?? "Unknown",
        price: item.priceAtTime,
        quantity: item.quantity,
        special_instructions: item.notes,
        status: item.status,
      })),
      notes: fullOrder.notes,
      guests_count: fullOrder.guestsCount,
      created_by: fullOrder.createdBy,
      created_at: fullOrder.createdAt,
      updated_at: fullOrder.updatedAt,
    };
  }
}
