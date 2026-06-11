import Elysia from "elysia";
import { auth_router } from "../../modules/auth/auth.module";
import { image_router } from "../../modules/images/image.module";

const router = new Elysia({ name: "api-v1-router" })
  .use(auth_router)
  .use(image_router);

router.get("/", async () => {
  return {
    message: "Welcome to the API router!",
  };
});

export { router as api_v1_router };
