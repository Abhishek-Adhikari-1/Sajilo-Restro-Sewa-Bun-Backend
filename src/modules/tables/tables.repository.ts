import { eq } from "drizzle-orm";
import { db, type TX } from "../../config/db";
import { tables, type NewTable, tableStatusEnum } from "../../db/index";

type TableStatus = typeof tableStatusEnum.enumValues[number];

export abstract class TablesRepo {
  private static conn(tx?: TX) {
    return tx ?? db;
  }

  static async findAllTables(
    tx?: TX,
    status?: TableStatus | "all",
    limit: number = 20,
    offset: number = 0,
  ) {
    return await this.conn(tx).query.tables.findMany({
      where:
        status && status.toLowerCase() !== "all"
          ? eq(tables.status, status.toLowerCase() as TableStatus)
          : undefined,
      orderBy: [tables.tableNumber],
      limit: limit,
      offset: offset,
      with: {
        orders: {
          where: (orders, { inArray }) =>
            inArray(orders.status, ["pending", "preparing", "ready", "served"]),
          limit: 1,
        },
      },
    });
  }

  static async findTableById(id: string, tx?: TX) {
    return (
      (await this.conn(tx).query.tables.findFirst({
        where: eq(tables.id, id),
        with: {
          orders: {
            where: (orders, { inArray }) =>
              inArray(orders.status, ["pending", "preparing", "ready", "served"]),
            limit: 1,
          },
        },
      })) ?? null
    );
  }

  static async updateTableStatus(id: string, status: TableStatus, tx?: TX) {
    const [table] = await this.conn(tx)
      .update(tables)
      .set({ status, updatedAt: new Date() })
      .where(eq(tables.id, id))
      .returning();
    return table;
  }

  static async createTable(data: NewTable, tx?: TX) {
    const [table] = await this.conn(tx)
      .insert(tables)
      .values(data)
      .returning();
    return table;
  }

  static async updateTable(id: string, data: Partial<NewTable>, tx?: TX) {
    const [table] = await this.conn(tx)
      .update(tables)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(tables.id, id))
      .returning();
    return table;
  }

  static async deleteTable(id: string, tx?: TX) {
    const [table] = await this.conn(tx)
      .delete(tables)
      .where(eq(tables.id, id))
      .returning();
    return table;
  }
}
