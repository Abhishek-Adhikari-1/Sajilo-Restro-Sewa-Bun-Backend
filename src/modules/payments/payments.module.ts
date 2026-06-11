import { Elysia } from "elysia";
import { checkoutBodySchema, historyQuerySchema } from "./payments.model";
import { PaymentsService } from "./payments.service";
import { authPlugin } from "../../middleware/auth.plugin";
import { authorizationPlugin } from "../../middleware/authorization-plugin";

 const router = new Elysia({ prefix: "/payments" })
  .use(authPlugin)
  .use(authorizationPlugin)
  .get(
    "/history",
    async ({ query }) => {
      const result = await PaymentsService.getHistory(query);
      return { success: true, ...result };
    },
    {
      query: historyQuerySchema,
      restrictTo: ["admin", "cashier"],
      detail: { summary: "Get paginated billing history" },
    }
  )
  .post(
    "/checkout",
    async ({ body, user }) => {
      const payment = await PaymentsService.checkout(body, user.id);
      return { success: true, data: payment };
    },
    {
      body: checkoutBodySchema,
      restrictTo: ["admin", "cashier"],
    }
  );

export { router as payments_router };