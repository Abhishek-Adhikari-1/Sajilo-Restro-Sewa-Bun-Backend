import Elysia from "elysia";
import { auth_router } from "../../modules/auth/auth.module";
import { table_router } from "../../modules/table/table.module";

const router = new Elysia({ name: "api-v1-router" })
  .use(auth_router)
  .use(table_router);

router.get("/", () => {
  return {
    message: "Welcome to the API router!",
  };
});

export { router as api_v1_router };
