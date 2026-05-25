import Elysia from "elysia";

const router = new Elysia();

router.get("/", ({ set }) => {
  set.status = 200;
  return {
    message: "Welcome to the API router!",
  };
});

export { router as api_v1_router };
