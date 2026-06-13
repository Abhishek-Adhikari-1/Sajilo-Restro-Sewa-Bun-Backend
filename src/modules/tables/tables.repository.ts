import { eq, and, or, ilike, count, sql } from "drizzle-orm";
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
    search?: string,
  ) {
    const conditions = [];

    if (status && status.toLowerCase() !== "all") {
      conditions.push(eq(tables.status, status.toLowerCase() as TableStatus));
    }

    if (search && search.trim() !== "") {
      const searchTerm = `%${search.trim()}%`;
      conditions.push(
        or(
          ilike(tables.section, searchTerm),
          sql`CAST(${tables.tableNumber} AS TEXT) ILIKE ${searchTerm}`
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    return await this.conn(tx).query.tables.findMany({
      where: whereClause,
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

  static async countTables(
    tx?: TX,
    status?: TableStatus | "all",
    search?: string,
  ) {
    const conditions = [];

    if (status && status.toLowerCase() !== "all") {
      conditions.push(eq(tables.status, status.toLowerCase() as TableStatus));
    }

    if (search && search.trim() !== "") {
      const searchTerm = `%${search.trim()}%`;
      conditions.push(
        or(
          ilike(tables.section, searchTerm),
          sql`CAST(${tables.tableNumber} AS TEXT) ILIKE ${searchTerm}`
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const result = await this.conn(tx)
      .select({ count: count() })
      .from(tables)
      .where(whereClause);

    return result[0]?.count ?? 0;
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
