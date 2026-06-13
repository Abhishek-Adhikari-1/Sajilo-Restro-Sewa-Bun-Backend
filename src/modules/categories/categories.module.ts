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
    let { categories: result, total } = await CategoriesService.getAllCategories(
      query.limit,
      query.offset,
      query.search,
    );

    if (user.role !== "admin") {
      result = result.map((category) => {
        const { createdAt, updatedAt, ...rest } = category;
        return rest;
      }) as typeof result;
    }

    return { categories: result, total, message: "Categories fetched successfully" };
  },
  {
    query: z.object({
      limit: z.coerce.number().min(1).max(100).optional().default(25),
      offset: z.coerce.number().min(0).optional().default(0),
      search: z.string().optional(),
    }),
    restrictTo: "*",
    detail: { summary: "Get all categories" },
  },
);

router.post(
  "/",
  async ({ body }) => {
    const result = await CategoriesService.createCategory({
      name: body.name,
      description: body.description,
      iconId: body.iconId,
      isActive: body.isActive,
    });
    return { data: result, message: "Category created successfully" };
  },
  {
    body: z.object({
      name: z.string().min(1),
      description: z.string().optional(),
      iconId: z.string().uuid().optional(),
      isActive: z.boolean().optional(),
    }),
    restrictTo: ["admin"],
    detail: { summary: "Create a new category" },
  },
);

router.patch(
  "/:id",
  async ({ params, body }) => {
    const result = await CategoriesService.updateCategory(params.id, {
      name: body.name,
      description: body.description,
      iconId: body.iconId,
      isActive: body.isActive,
    });
    return { data: result, message: "Category updated successfully" };
  },
  {
    body: z.object({
      name: z.string().optional(),
      description: z.string().optional(),
      iconId: z.string().uuid().optional().nullable(),
      isActive: z.boolean().optional(),
    }),
    restrictTo: ["admin"],
    detail: { summary: "Update category details" },
  },
);

router.delete(
  "/:id",
  async ({ params }) => {
    await CategoriesService.deleteCategory(params.id);
    return { message: "Category deleted successfully" };
  },
  {
    restrictTo: ["admin"],
    detail: { summary: "Delete a category" },
  },
);

export { router as categories_router };
