import Elysia from "elysia";
import { MenusModel } from "./menus.model";
import { MenusService } from "./menus.service";
import { authPlugin } from "../../middleware/auth.plugin";
import { authorizationPlugin } from "../../middleware/authorization-plugin";

const router = new Elysia({
  name: "menus-router",
  prefix: "/menus",
  tags: ["Menus"],
})
  .use(authPlugin)
  .use(authorizationPlugin);

router.get(
  "/",
  async ({ query, user }) => {
    var result = await MenusService.getAllMenus(
      query.categoryId,
      query.isAvailable,
      query.search,
      query.limit,
      query.offset,
    );

    if (user.role !== "admin") {
      result = result.map((menu) => {
        const { createdAt, updatedAt, ...rest } = menu;
        return rest;
      }) as typeof result;
    }

    return { menus: result, message: "Menu items fetched successfully" };
  },
  {
    query: MenusModel.getAllMenusQuery,
    restrictTo: "*",
    detail: { summary: "Get all menu items" },
  },
);

router.get(
  "/:id",
  async ({ params, user }) => {
    var result = await MenusService.getMenuById(params.id);

    if (user.role !== "admin") {
      const { createdAt, updatedAt, ...rest } = result;
      result = rest as unknown as typeof result;
    }

    return { menu: result, message: "Menu item fetched successfully" };
  },
  {
    restrictTo: "*",
    detail: { summary: "Get menu item by ID" },
  },
);

router.post(
  "/",
  async ({ body }) => {
    const result = await MenusService.createMenu({
      categoryId: body.categoryId,
      name: body.name,
      description: body.description,
      price: body.price,
      estimatedPreparationTime: body.estimatedPreparationTime,
      isAvailable: body.isAvailable,
      imageId: body.imageId,
    });
    return { menu: result, message: "Menu item created successfully" };
  },
  {
    body: MenusModel.createMenuBody,
    restrictTo: ["admin"],
    detail: { summary: "Create a new menu item" },
  },
);

router.put(
  "/:id",
  async ({ params, body }) => {
    const result = await MenusService.updateMenu(params.id, {
      categoryId: body.categoryId,
      name: body.name,
      description: body.description,
      price: body.price,
      estimatedPreparationTime: body.estimatedPreparationTime,
      imageId: body.imageId,
      isAvailable: body.isAvailable,
    });
    return { menu: result, message: "Menu item updated successfully" };
  },
  {
    body: MenusModel.updateMenuBody,
    restrictTo: ["admin"],
    detail: { summary: "Update menu item details" },
  },
);

router.delete(
  "/:id",
  async ({ params }) => {
    const result = await MenusService.deleteMenu(params.id);
    return { ...result, message: "Menu item deleted successfully" };
  },
  {
    restrictTo: ["admin"],
    detail: { summary: "Delete a menu item" },
  },
);

router.patch(
  "/:id/status",
  async ({ params, body, user }) => {
    var result = await MenusService.updateMenuStatus(
      params.id,
      body.isAvailable,
    );

    if (user.role !== "admin") {
      const { createdAt, updatedAt, ...rest } = result;
      result = rest as unknown as typeof result;
    }

    return { menu: result, message: "Menu item status updated successfully" };
  },
  {
    body: MenusModel.updateStatusBody,
    restrictTo: ["admin", "waiter", "cashier"],
    detail: { summary: "Update menu item availability" },
  },
);

export { router as menus_router };
