import { TablesRepo } from "./tables.repository";
import { HTTP_STATUS } from "../../utils/http-status";
import { io } from "../../app";
import { AppError } from "../../utils/app-error";
import type { NewTable, tableStatusEnum } from "../../db/index";

type TableStatus = typeof tableStatusEnum.enumValues[number];

export abstract class TablesService {
  static async getAllTables(
    status?: TableStatus | "all",
    limit: number = 20,
    offset: number = 0,
    search?: string,
  ) {
    const tables = await TablesRepo.findAllTables(
      undefined,
      status,
      limit,
      offset,
      search,
    );
    const total = await TablesRepo.countTables(
      undefined,
      status,
      search,
    );
    return { tables, total };
  }

  static async getTableById(id: string) {
    const table = await TablesRepo.findTableById(id);
    if (!table) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, "Table not found");
    }
    return table;
  }

  static async updateTableStatus(id: string, status: TableStatus) {
    const table = await TablesRepo.findTableById(id);
    if (!table) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, "Table not found");
    }

    const updatedTable = await TablesRepo.updateTableStatus(id, status);

    // Emit event to all connected clients
    io.emit("table_updated", { table: updatedTable });

    return updatedTable!;
  }

  static async createTable(data: NewTable) {
    const table = await TablesRepo.createTable(data);
    io.emit("table_updated", { table }); // Or perhaps 'table_created'
    return table;
  }

  static async updateTable(id: string, data: Partial<NewTable>) {
    const existing = await TablesRepo.findTableById(id);
    if (!existing) throw new AppError(HTTP_STATUS.NOT_FOUND, "Table not found");

    const table = await TablesRepo.updateTable(id, data);
    const completeTable = await TablesRepo.findTableById(id);
    io.emit("table_updated", { table: completeTable });
    return {
      message: "Table updated successfully",
      table: completeTable,
    };
  }

  static async deleteTable(id: string) {
    const existing = await TablesRepo.findTableById(id);
    if (!existing) throw new AppError(HTTP_STATUS.NOT_FOUND, "Table not found");

    await TablesRepo.deleteTable(id);
    // Might want to emit table_deleted if needed, omitting for now or you can emit:
    io.emit("table_deleted", { id });
    return {};
  }
}
