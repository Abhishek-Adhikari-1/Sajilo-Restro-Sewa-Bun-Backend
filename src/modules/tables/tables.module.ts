import Elysia from "elysia";
import { TablesModel } from "./tables.model";
import { TablesService } from "./tables.service";
import { authPlugin } from "../../middleware/auth.plugin";
import { authorizationPlugin } from "../../middleware/authorization-plugin";

const router = new Elysia({
  name: "tables-router",
  prefix: "/tables",
  tags: ["Tables"],
})
  .use(authPlugin)
  .use(authorizationPlugin);

router.get(
  "/",
  async ({ query, user }) => {
    let { tables: result, total } = await TablesService.getAllTables(
      query.status,
      query.limit,
      query.offset,
      query.search,
    );

    if (user.role !== "admin") {
      result = result.map((table) => {
        const { createdAt, updatedAt, ...rest } = table;
        return rest;
      }) as typeof result;
    }

    return { tables: result, total, message: "Tables fetched successfully" };
  },
  {
    query: TablesModel.getAllTablesQuery,
    restrictTo: ["admin", "waiter", "cashier", "kitchen"],
    detail: { summary: "Get all tables" },
  },
);

router.get(
  "/:id",
  async ({ params, user }) => {
    var result = await TablesService.getTableById(params.id);

    if (user.role !== "admin") {
      const { createdAt, updatedAt, ...rest } = result;
      result = rest as unknown as typeof result;
    }

    return { table: result, message: "Table fetched successfully" };
  },
  {
    restrictTo: ["admin", "waiter", "cashier", "kitchen"],
    detail: { summary: "Get table by ID" },
  },
);

router.post(
  "/",
  async ({ body }) => {
    const result = await TablesService.createTable(body);
    return { table: result, message: "Table created successfully" };
  },
  {
    body: TablesModel.createTableBody,
    restrictTo: ["admin"],
    detail: { summary: "Create a new table" },
  },
);

router.put(
  "/:id",
  async ({ params, body }) => {
    const result = await TablesService.updateTable(params.id, body);
    return { ...result, message: "Table updated successfully" };
  },
  {
    body: TablesModel.updateTableBody,
    restrictTo: ["admin"],
    detail: { summary: "Update table details" },
  },
);

router.delete(
  "/:id",
  async ({ params }) => {
    const result = await TablesService.deleteTable(params.id);
    return { ...result, message: "Table deleted successfully" };
  },
  {
    restrictTo: ["admin"],
    detail: { summary: "Delete a table" },
  },
);

router.patch(
  "/:id/status",
  async ({ params, body, user }) => {
    var result = await TablesService.updateTableStatus(params.id, body.status);

    if (user.role !== "admin") {
      const { createdAt, updatedAt, ...rest } = result;
      result = rest as unknown as typeof result;
    }

    return { table: result, message: "Table status updated successfully" };
  },
  {
    body: TablesModel.updateStatusBody,
    restrictTo: ["admin", "waiter", "cashier"],
    detail: { summary: "Update table status" },
  },
);

export { router as tables_router };
