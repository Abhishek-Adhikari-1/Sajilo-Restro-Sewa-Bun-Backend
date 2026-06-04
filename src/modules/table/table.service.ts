import { AppError } from "../../utils/app-error";
import { HTTP_STATUS } from "../../utils/http-status";
import {
  createTableDocument,
  getTableById,
  getTableByNumber,
  tableCollections,
  updateTableById,
  type TableModel,
} from "./table.model";

export abstract class TableService {
  static async createTable({
    table_number,
    section,
    capacity,
    status,
  }: TableModel["createTable"]) {
    try {
      const data = await createTableDocument({
        table_number,
        capacity,
        section,
        status,
      });

      return {
        id: data.id,
        tableNumber: data.table_number,
        capacity: data.capacity,
        section: data.section,
        status: data.status,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    } catch (err: any) {
      if (err instanceof AppError) {
        throw err;
      }
      throw new AppError(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        err.message || "Table creation failed",
      );
    }
  }

  static async getAllTables({
    limit,
    cursor,
    status,
    section,
  }: TableModel["getAllTables"]) {
    try {
      let query = tableCollections.orderBy("table_number");

      if (status !== "all") {
        query = query.where("status", "==", status);
      }

      if (section) {
        query = query.where("section", "==", section);
      }

      const snapshot = await query.limit(limit).startAfter(cursor).get();

      return {
        data: snapshot.docs.map((doc) => ({
          id: doc.id,
          tableNumber: doc.data().table_number,
          capacity: doc.data().capacity,
          section: doc.data().section,
          currentOrders: doc.data().current_orders,
          reservedFor: doc.data().reserved_for,
          occupiedSeats: doc.data().occupied_seats,
          status: doc.data().status,
          createdAt: doc.data().created_at,
          updatedAt: doc.data().updated_at,
        })),
      };
    } catch (err: any) {
      if (err instanceof AppError) {
        throw err;
      }

      throw new AppError(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        err.message || "Table fetch failed",
      );
    }
  }

  static async updateTable({
    id,
    table_number,
    capacity,
    section,
    status,
  }: TableModel["updateTable"]) {
    try {
      const table = await getTableById(id);

      if (!table) {
        throw new AppError(HTTP_STATUS.NOT_FOUND, "Table not found");
      }

      // Check table number uniqueness only if changing it
      if (table_number !== undefined && table_number !== table.table_number) {
        const existingTable = await getTableByNumber(table_number);

        // If the new table number is the same as the current table number, we can skip the check
        if (existingTable && existingTable.id === id) {
          return {
            id: table.id,
            tableNumber: table.table_number,
            capacity: table.capacity,
            section: table.section,
            occupiedSeats: table.occupied_seats,
            status: table.status,
            createdAt: table.created_at,
            updatedAt: table.updated_at,
          };
        }

        if (existingTable && existingTable.id !== id) {
          throw new AppError(
            HTTP_STATUS.CONFLICT,
            "Table number already exists",
          );
        }
      }

      const updateData = Object.fromEntries(
        Object.entries({
          table_number,
          capacity,
          section,
          status,
        }).filter(([, value]) => value !== undefined),
      );

      const data = await updateTableById(id, updateData);

      return {
        id: data.id,
        tableNumber: data.table_number,
        capacity: data.capacity,
        section: data.section,
        occupiedSeats: data.occupied_seats,
        status: data.status,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    } catch (err: any) {
      if (err instanceof AppError) {
        throw err;
      }

      throw new AppError(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        err.message || "Table update failed",
      );
    }
  }
}
