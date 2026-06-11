import { db } from "../../config/db";
import { orders, orderItems, tables, payments } from "../../db/index";
import { sql, eq, and, gte, lt } from "drizzle-orm";
import { OrdersRepo } from "../orders/orders.repository";

export class DashboardsService {
  static async getAdminDashboard() {
    // Basic aggregation
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const activeOrders = await OrdersRepo.findActiveOrders();

    const tableStats = await db
      .select({
        status: tables.status,
        count: sql<number>`count(*)`.mapWith(Number),
      })
      .from(tables)
      .groupBy(tables.status);

    const tablesSummary = {
      available: tableStats.find((t) => t.status === "available")?.count || 0,
      occupied: tableStats.find((t) => t.status === "occupied")?.count || 0,
    };

    return {
      totalRevenueToday: 0, // Placeholder if no payments table yet
      activeOrdersCount: activeOrders.length,
      tableStats: tablesSummary,
      recentOrders: activeOrders.slice(0, 10),
    };
  }

  static async getWaiterDashboard(userId: string) {
    const activeOrders = await OrdersRepo.findActiveOrders();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const myOrdersTodayResult = await db
      .select({ count: sql<number>`count(*)`.mapWith(Number) })
      .from(orders)
      .where(and(eq(orders.createdBy, userId), gte(orders.createdAt, today)));

    const tableStats = await db
      .select({
        status: tables.status,
        count: sql<number>`count(*)`.mapWith(Number),
      })
      .from(tables)
      .groupBy(tables.status);

    const tablesSummary = {
      available: tableStats.find((t) => t.status === "available")?.count || 0,
      occupied: tableStats.find((t) => t.status === "occupied")?.count || 0,
    };

    return {
      myOrdersToday: myOrdersTodayResult[0]?.count || 0,
      activeOrders: activeOrders.length,
      tableStats: tablesSummary,
      recentOrders: activeOrders.slice(0, 10),
    };
  }

  static async getKitchenDashboard() {
    const activeOrders = await OrdersRepo.findActiveOrders();

    const pendingOrders = activeOrders.filter(
      (o) => o.status === "pending",
    ).length;
    const preparingOrders = activeOrders.filter(
      (o) => o.status === "preparing",
    ).length;
    const readyOrders = activeOrders.filter((o) => o.status === "ready").length;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const completedTodayResult = await db
      .select({ count: sql<number>`count(*)`.mapWith(Number) })
      .from(orders)
      .where(and(eq(orders.status, "completed"), gte(orders.updatedAt, today)));

    return {
      pendingOrders,
      preparingOrders,
      readyOrders,
      completedToday: completedTodayResult[0]?.count || 0,
      recentOrders: activeOrders.filter((o) =>
        ["pending", "preparing", "ready"].includes(o.status),
      ),
    };
  }

  static async getCashierDashboard() {
    const unpaidOrders = await OrdersRepo.findUnpaidOrders();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const revenueResult = await db
      .select({
        total: sql<number>`sum(${payments.totalAmount})`.mapWith(Number),
        count: sql<number>`count(*)`.mapWith(Number),
        totalDiscount: sql<number>`sum(CASE WHEN ${payments.discountType} = 'percentage' THEN (${payments.subtotal} * ${payments.discountValue} / 100) ELSE ${payments.discountValue} END)`.mapWith(Number),
      })
      .from(payments)
      .where(gte(payments.createdAt, today));

    return {
      pendingBills: unpaidOrders.length,
      totalRevenue: revenueResult[0]?.total || 0,
      salesCount: revenueResult[0]?.count || 0,
      totalDiscount: revenueResult[0]?.totalDiscount || 0,
      recentOrders: unpaidOrders,
    };
  }
}
