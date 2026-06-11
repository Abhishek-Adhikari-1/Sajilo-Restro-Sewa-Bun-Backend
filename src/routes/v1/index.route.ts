import Elysia from "elysia";
import { auth_router } from "../../modules/auth/auth.module";
import { image_router } from "../../modules/images/image.module";
import { tables_router } from "../../modules/tables/tables.module";
import { menus_router } from "../../modules/menus/menus.module";
import { categories_router } from "../../modules/categories/categories.module";
import { orders_router } from "../../modules/orders/orders.module";
import { dashboards_router } from "../../modules/dashboards/dashboards.module";
import { payments_router } from "../../modules/payments/payments.module";
import { customers_router } from "../../modules/customers/customers.module";

const router = new Elysia({ name: "api-v1-router" })
  .use(auth_router)
  .use(image_router)
  .use(tables_router)
  .use(menus_router)
  .use(categories_router)
  .use(orders_router)
  .use(dashboards_router)
  .use(payments_router)
  .use(customers_router);

router.get("/", async () => {
  return {
    message: "Welcome to the API router!",
  };
});

export { router as api_v1_router };
