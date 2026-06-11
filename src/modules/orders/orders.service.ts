import { OrdersRepo, type AddOrderItemInput } from "./orders.repository";
import { TablesRepo } from "../tables/tables.repository";
import type { OrdersModel } from "./orders.model";
import { io } from "../../app";
import type { orderStatusEnum, orderItemStatusEnum } from "../../db/index";

type OrderStatus = typeof orderStatusEnum.enumValues[number];
type OrderItemStatus = typeof orderItemStatusEnum.enumValues[number];

export class OrdersService {
  static async createOrder(data: OrdersModel["createOrderBody"] & { created_by?: string }) { 
    const order = await OrdersRepo.createOrder({
      table_id: data.table_id,
      created_by: data.created_by || "00000000-0000-0000-0000-000000000000", // Needs auth user ID passed usually
      guests_count: data.guests_count,
      notes: data.notes,
      items: data.items,
    });

    // Broadcast events
    if (io) {
      io.emit("order_created", order);
      const table = await TablesRepo.findTableById(data.table_id);
      if (table) {
        io.emit("table_updated", { table });
      }
    }

    return order;
  }

  static async getActiveOrders() {
    return await OrdersRepo.findActiveOrders();
  }

  static async getOrderById(id: string) {
    const order = await OrdersRepo.getOrderById(id);
    if (!order) throw new Error("Order not found");
    return order;
  }

  static async updateOrderStatus(id: string, status: OrderStatus) {
    const order = await OrdersRepo.updateOrderStatus(undefined, id, status);

    if (io) {
      io.emit("order_updated", order);
      if (order) {
        const table = await TablesRepo.findTableById(order.table_id);
        if (table) {
          io.emit("table_updated", { table });
        }
      }
    }

    return order;
  }

  static async addItemsToOrder(id: string, items: AddOrderItemInput[]) {
    const newItems = await OrdersRepo.addItemsToOrder(undefined, id, items);

    if (io) {
      io.emit("order_items_added", { orderId: id, items: newItems });
    }

    return newItems;
  }

  static async updateOrderItems(id: string, items: AddOrderItemInput[], notes?: string | null) {
    const updatedOrder = await OrdersRepo.updateOrderItems(undefined, id, items, notes);
    
    // Emit socket event for real-time updates
    io.emit("order_updated", updatedOrder);
    
    return updatedOrder;
  }

  static async updateItemStatus(itemId: string, status: OrderItemStatus) {
    const item = await OrdersRepo.updateItemStatus(undefined, itemId, status);

    if (io) {
      io.emit("order_item_updated", item);
    }

    return item;
  }
}
