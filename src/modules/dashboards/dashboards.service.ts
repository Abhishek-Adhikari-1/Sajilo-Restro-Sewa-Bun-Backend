import { db } from "../../config/db";
import { orders, orderItems, tables, payments, expenses } from "../../db/index";
import { sql, eq, and, gte, lt } from "drizzle-orm";
import { OrdersRepo } from "../orders/orders.repository";

function getClientDateBoundaries(offsetMinutes: number = 0, period: string = "today") {
  const now = new Date();
  const clientTimeMs = now.getTime() + offsetMinutes * 60000;
  const clientDate = new Date(clientTimeMs);
  
  clientDate.setUTCHours(0, 0, 0, 0);

  if (period === "weekly") {
    clientDate.setUTCDate(clientDate.getUTCDate() - 7);
  } else if (period === "monthly") {
    clientDate.setUTCMonth(clientDate.getUTCMonth() - 1);
  } else if (period === "yearly") {
    clientDate.setUTCFullYear(clientDate.getUTCFullYear() - 1);
  }

  return new Date(clientDate.getTime() - offsetMinutes * 60000);
}

function getTzString(offsetMinutes: number) {
  const sign = offsetMinutes >= 0 ? '+' : '-';
  const absOffset = Math.abs(offsetMinutes);
  const hrs = Math.floor(absOffset / 60).toString().padStart(2, '0');
  const mins = (absOffset % 60).toString().padStart(2, '0');
  return `${sign}${hrs}:${mins}`;
}

export class DashboardsService {
  static async getAdminDashboard(period: string = "today", offsetMinutes: number = 0) {
    const startDate = getClientDateBoundaries(offsetMinutes, period);

    let dateTruncUnit = "hour";
    if (period === "weekly" || period === "monthly") {
      dateTruncUnit = "day";
    } else if (period === "yearly") {
      dateTruncUnit = "month";
    }

    const tzStr = getTzString(offsetMinutes);

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

    const revenueResult = await db
      .select({
        total: sql<number>`sum(${payments.totalAmount})`.mapWith(Number),
      })
      .from(payments)
      .where(gte(payments.createdAt, startDate));

    const revenueTrendResult = await db
      .select({
        label: sql<string>`to_char(date_trunc(${sql.raw(`'${dateTruncUnit}'`)}, ${payments.createdAt} AT TIME ZONE 'UTC' AT TIME ZONE ${sql.raw(`'${tzStr}'`)}), 'YYYY-MM-DD HH24:00:00')`,
        value: sql<number>`sum(${payments.totalAmount})`.mapWith(Number),
      })
      .from(payments)
      .where(gte(payments.createdAt, startDate))
      .groupBy(sql`date_trunc(${sql.raw(`'${dateTruncUnit}'`)}, ${payments.createdAt} AT TIME ZONE 'UTC' AT TIME ZONE ${sql.raw(`'${tzStr}'`)})`)
      .orderBy(sql`date_trunc(${sql.raw(`'${dateTruncUnit}'`)}, ${payments.createdAt} AT TIME ZONE 'UTC' AT TIME ZONE ${sql.raw(`'${tzStr}'`)})`);

    const expenseResult = await db
      .select({
        total: sql<number>`sum(${expenses.amount})`.mapWith(Number),
      })
      .from(expenses)
      .where(gte(expenses.date, startDate));

    const expenseTrendResult = await db
      .select({
        label: sql<string>`to_char(date_trunc(${sql.raw(`'${dateTruncUnit}'`)}, ${expenses.date} AT TIME ZONE 'UTC' AT TIME ZONE ${sql.raw(`'${tzStr}'`)}), 'YYYY-MM-DD HH24:00:00')`,
        value: sql<number>`sum(${expenses.amount})`.mapWith(Number),
      })
      .from(expenses)
      .where(gte(expenses.date, startDate))
      .groupBy(sql`date_trunc(${sql.raw(`'${dateTruncUnit}'`)}, ${expenses.date} AT TIME ZONE 'UTC' AT TIME ZONE ${sql.raw(`'${tzStr}'`)})`)
      .orderBy(sql`date_trunc(${sql.raw(`'${dateTruncUnit}'`)}, ${expenses.date} AT TIME ZONE 'UTC' AT TIME ZONE ${sql.raw(`'${tzStr}'`)})`);

    const orderStatusResult = await db
      .select({
        status: orders.status,
        count: sql<number>`count(*)`.mapWith(Number),
      })
      .from(orders)
      .where(gte(orders.createdAt, startDate))
      .groupBy(orders.status);

    return {
      period,
      totalRevenue: revenueResult[0]?.total || 0,
      totalExpenses: expenseResult[0]?.total || 0,
      activeOrdersCount: activeOrders.length,
      tableStats: tablesSummary,
      recentOrders: activeOrders.slice(0, 10),
      revenueTrend: revenueTrendResult,
      expenseTrend: expenseTrendResult,
      orderStatusDistribution: orderStatusResult,
    };
  }

  static async getWaiterDashboard(userId: string, offsetMinutes: number = 0) {
    const activeOrders = await OrdersRepo.findActiveOrders();
    const today = getClientDateBoundaries(offsetMinutes, "today");

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

  static async getKitchenDashboard(offsetMinutes: number = 0) {
    const activeOrders = await OrdersRepo.findActiveOrders();

    const pendingOrders = activeOrders.filter(
      (o) => o.status === "pending",
    ).length;
    const preparingOrders = activeOrders.filter(
      (o) => o.status === "preparing",
    ).length;
    const readyOrders = activeOrders.filter((o) => o.status === "ready").length;

    const today = getClientDateBoundaries(offsetMinutes, "today");

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

  static async getCashierDashboard(offsetMinutes: number = 0) {
    const unpaidOrders = await OrdersRepo.findUnpaidOrders();
    const today = getClientDateBoundaries(offsetMinutes, "today");

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
