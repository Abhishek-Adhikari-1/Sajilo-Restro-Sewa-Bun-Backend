import Elysia from "elysia";
import { CategoriesService } from "./categories.service";
import { authPlugin } from "../../middleware/auth.plugin";
import { authorizationPlugin } from "../../middleware/authorization-plugin";
import z from "zod";

const router = new Elysia({
  name: "categories-router",
  prefix: "/categories",
  tags: ["Categories"],
})
  .use(authPlugin)
  .use(authorizationPlugin);

router.get(
  "/",
  async ({ query, user }) => {
    var result = await CategoriesService.getAllCategories(
      query.limit,
      query.offset,
    );

    if (user.role !== "admin") {
      result = result.map((category) => {
        const { createdAt, updatedAt, ...rest } = category;
        return rest;
      }) as typeof result;
    }

    return { categories: result, message: "Categories fetched successfully" };
  },
  {
    query: z.object({
      limit: z.coerce.number().min(1).max(100).optional().default(25),
      offset: z.coerce.number().min(0).optional().default(0),
    }),
    restrictTo: "*",
    detail: { summary: "Get all categories" },
  },
);

export { router as categories_router };
