import { PaymentsRepo } from "./payments.repository";
import type { CheckoutBody, HistoryQuery } from "./payments.model";
import { io } from "../../app";
import { OrdersRepo } from "../orders/orders.repository";
import { TablesRepo } from "../tables/tables.repository";

export class PaymentsService {
  static async getHistory(query: HistoryQuery) {
    return await PaymentsRepo.getHistory(query);
  }

  static async checkout(data: CheckoutBody, processedBy: string) {
    const payment = await PaymentsRepo.checkout(data, processedBy);

    // After checkout, the order status changes to "completed", so broadcast updates
    if (io) {
      // Find the updated order
      const orders = await OrdersRepo.findActiveOrders();
      // Since it's completed, findActiveOrders might NOT return it! 
      // But we can emit a general "order_completed" event
      io.emit("order_completed", { orderId: data.order_id });

      // The table status has changed, let's find the table via order
      // Wait, we don't have the order table easily here without another query
      // but we can just emit a "tables_refresh" or similar, or find it:
      io.emit("order_updated", { id: data.order_id, status: "completed" });
    }

    return payment;
  }
}
