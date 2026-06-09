import Elysia from "elysia";
import { db } from "../../config/db";

const router = new Elysia({ name: "api-v1-router" });

router.get("/", async () => {
  const users = await db.query.users.findMany();

  return {
    users,
    message: "Welcome to the API router!",
  };
});

export { router as api_v1_router };
