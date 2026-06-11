import Elysia from "elysia";
import { OrdersService } from "./orders.service";
import {
  updateOrderStatusSchema,
  updateItemStatusSchema,
  OrdersModel,
} from "./orders.model";
import { authPlugin } from "../../middleware/auth.plugin";
import { authorizationPlugin } from "../../middleware/authorization-plugin";

const router = new Elysia({
  name: "orders-router",
  prefix: "/orders",
  tags: ["Orders"],
})
  .use(authPlugin)
  .use(authorizationPlugin);

router.post(
  "/",
  async ({ body, user }) => {
    const order = await OrdersService.createOrder({
      ...body,
      created_by: user.id,
    });
    return { data: order, message: "Order created successfully" };
  },
  {
    body: OrdersModel["createOrderBody"],
    restrictTo: ["admin", "waiter", "cashier"],
    detail: { summary: "Create a new order" },
  },
);

router.get(
  "/active",
  async () => {
    const orders = await OrdersService.getActiveOrders();
    return { data: orders, message: "Active orders fetched successfully" };
  },
  {
    restrictTo: ["admin", "waiter", "cashier", "kitchen"],
    detail: { summary: "Get all active orders" },
  },
);

router.get(
  "/:id",
  async ({ params: { id } }) => {
    const order = await OrdersService.getOrderById(id);
    return { data: order, message: "Order details fetched successfully" };
  },
  {
    restrictTo: ["admin", "waiter", "cashier", "kitchen"],
    detail: { summary: "Get order details by ID" },
  },
);

router.patch(
  "/:id/status",
  async ({ params: { id }, body }) => {
    const { status } = updateOrderStatusSchema.parse(body);
    const order = await OrdersService.updateOrderStatus(id, status);
    return { data: order, message: "Order status updated successfully" };
  },
  {
    restrictTo: ["admin", "waiter", "cashier", "kitchen"],
    detail: { summary: "Update order status" },
  },
);

router.post(
  "/:id/items",
  async ({ params: { id }, body }) => {
    // Basic validation, should use zod array schema in production
    const items = await OrdersService.addItemsToOrder(
      id,
      body as Parameters<typeof OrdersService.addItemsToOrder>[1],
    );
    return { data: items, message: "Items added to order successfully" };
  },
  {
    restrictTo: ["admin", "waiter", "cashier"],
    detail: { summary: "Add items to existing order" },
  },
);

router.put(
  "/:id/items",
  async ({ params: { id }, body }) => {
    let itemsPayload: any;
    let notesPayload: string | null | undefined = undefined;

    if (Array.isArray(body)) {
      itemsPayload = body;
    } else if (body && typeof body === "object") {
      itemsPayload = (body as any).items;
      notesPayload = (body as any).notes;
    } else {
      throw new Error("Invalid payload format");
    }

    const items = await OrdersService.updateOrderItems(
      id,
      itemsPayload,
      notesPayload,
    );
    return { data: items, message: "Order items updated successfully" };
  },
  {
    restrictTo: ["admin", "waiter", "cashier"],
    detail: { summary: "Update (replace/sync) items for an existing order" },
  },
);

router.patch(
  "/:id/items/:itemId/status",
  async ({ params: { id, itemId }, body }) => {
    const { status } = updateItemStatusSchema.parse(body);
    const item = await OrdersService.updateItemStatus(itemId, status);
    return { data: item, message: "Item status updated successfully" };
  },
  {
    restrictTo: ["admin", "kitchen", "cashier", "waiter"],
    detail: { summary: "Update item status" },
  },
);

export { router as orders_router };
