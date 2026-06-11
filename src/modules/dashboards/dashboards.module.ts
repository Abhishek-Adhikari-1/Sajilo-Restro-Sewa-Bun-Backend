import { Elysia } from "elysia";
import { DashboardsService } from "./dashboards.service";
import { authPlugin } from "../../middleware/auth.plugin";
import { authorizationPlugin } from "../../middleware/authorization-plugin";

const router = new Elysia({ prefix: "/dashboard" })
  .use(authPlugin)
  .use(authorizationPlugin)
  .get(
    "/admin",
    async () => {
      const data = await DashboardsService.getAdminDashboard();
      return { success: true, data };
    },
    {
      restrictTo: ["admin"],
    },
  )
  .get(
    "/waiter",
    async ({ user }) => {
      const data = await DashboardsService.getWaiterDashboard(user.id);
      return { success: true, data };
    },
    {
      restrictTo: ["admin", "waiter"],
    },
  )
  .get(
    "/kitchen",
    async () => {
      const data = await DashboardsService.getKitchenDashboard();
      return { success: true, data };
    },
    {
      restrictTo: ["admin", "kitchen"],
    },
  )
  .get(
    "/cashier",
    async () => {
      const data = await DashboardsService.getCashierDashboard();
      return { success: true, data };
    },
    {
      restrictTo: ["admin", "cashier"],
    },
  );

export { router as dashboards_router };
