import Elysia from "elysia";

const router = new Elysia({ name: "api-v1-router" });

router.get("/", () => {
  return {
    message: "Welcome to the API router!",
  };
});

export { router as api_v1_router };
