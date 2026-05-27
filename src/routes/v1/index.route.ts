import Elysia from "elysia";
import { auth_router } from "../../modules/auth/auth.module";

const router = new Elysia({ name: "api-v1-router" }).use(auth_router);

router.get("/", ({ set }) => {
  return {
    message: "Welcome to the API router!",
  };
});

export { router as api_v1_router };
