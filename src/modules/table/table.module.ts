import Elysia from "elysia";
import { authPlugin } from "../../middleware/auth-plugin";
import { authorizationPlugin } from "../../middleware/authorization-plugin";
import { TableModel } from "./table.model";
import { TableService } from "./table.service";

const router = new Elysia({
  name: "table-router",
  prefix: "/table",
})
  .use(authPlugin)
  .use(authorizationPlugin);

router.post(
  "/",
  async ({ body }) => {
    const res = await TableService.createTable({
      table_number: body.table_number,
      section: body.section,
      capacity: body.capacity,
      status: body.status,
    });
    return {
      message: "Table created successfully",
      ...res,
    };
  },
  {
    restrictTo: ["admin"],
    body: TableModel["createTable"],
  },
);

router.get(
  "/",
  async ({ query }) => {
    const res = await TableService.getAllTables({
      limit: query.limit,
      cursor: query.cursor,
      status: query.status,
      section: query.section,
    });
    return {
      message: "Tables fetched successfully",
      ...res,
    };
  },
  {
    restrictTo: "*",
    query: TableModel["getAllTables"],
  },
);

router.patch(
  "/:id",
  async ({ body, params }) => {
    const res = await TableService.updateTable({
      id: params.id,
      ...body,
    });
    return {
      message: "Table updated successfully",
      ...res,
    };
  },
  {
    restrictTo: ["admin"],
    body: TableModel["updateTable"].omit({ id: true }),
    params: TableModel["updateTable"].pick({ id: true }),
  },
);

export { router as table_router };
