import { Elysia } from "elysia";
import { DashboardsService } from "./dashboards.service";
import { authPlugin } from "../../middleware/auth.plugin";
import { authorizationPlugin } from "../../middleware/authorization-plugin";

const router = new Elysia({ prefix: "/dashboard" })
  .use(authPlugin)
  .use(authorizationPlugin)
  .get(
    "/admin",
    async ({ query, headers }) => {
      const offsetMinutes = parseInt(headers['x-timezone-offset'] || '0', 10);
      const period = typeof query.period === "string" ? query.period : "today";
      const data = await DashboardsService.getAdminDashboard(period, offsetMinutes);
      return { success: true, data };
    },
    {
      restrictTo: ["admin"],
    },
  )
  .get(
    "/waiter",
    async ({ user, headers }) => {
      const offsetMinutes = parseInt(headers['x-timezone-offset'] || '0', 10);
      const data = await DashboardsService.getWaiterDashboard(user.id, offsetMinutes);
      return { success: true, data };
    },
    {
      restrictTo: ["admin", "waiter"],
    },
  )
  .get(
    "/kitchen",
    async ({ headers }) => {
      const offsetMinutes = parseInt(headers['x-timezone-offset'] || '0', 10);
      const data = await DashboardsService.getKitchenDashboard(offsetMinutes);
      return { success: true, data };
    },
    {
      restrictTo: ["admin", "kitchen"],
    },
  )
  .get(
    "/cashier",
    async ({ headers }) => {
      const offsetMinutes = parseInt(headers['x-timezone-offset'] || '0', 10);
      const data = await DashboardsService.getCashierDashboard(offsetMinutes);
      return { success: true, data };
    },
    {
      restrictTo: ["admin", "cashier"],
    },
  );

export { router as dashboards_router };
