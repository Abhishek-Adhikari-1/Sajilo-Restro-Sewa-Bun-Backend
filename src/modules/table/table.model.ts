import { z } from "zod";
import { db } from "../../config/firebase";
import { tableStatuses } from "../../types/table";
import { FieldPath, FieldValue, Timestamp } from "firebase-admin/firestore";
import { AppError } from "../../utils/app-error";
import { HTTP_STATUS } from "../../utils/http-status";
import { status, type UnwrapSchema } from "elysia";

export const tableCollections = db.collection("tables");

export const tableSchemaBase = z.object({
  id: z.string(),
  table_number: z.number().int().positive(),
  capacity: z.number().int().min(1).default(4),
  occupied_seats: z.number().int().min(0).default(0),
  status: z.enum(tableStatuses).default("available"),
  current_orders: z.array(z.string()).default([]),
  section: z.string().nullable().default(null),
  reserved_for: z
    .object({
      name: z.string().nullable().default(null),
      email: z.email().nullable().default(null),
      phone: z.string().nullable().default(null),
      reserve_from: z
        .union([z.date(), z.instanceof(Timestamp), z.instanceof(FieldPath)])
        .nullable()
        .default(null),
      reserve_until: z
        .union([z.date(), z.instanceof(Timestamp), z.instanceof(FieldPath)])
        .nullable()
        .default(null),
      notes: z.string().nullable().default(null),
    })
    .nullable()
    .default(null),

  created_at: z.union([
    z.date(),
    z.instanceof(Timestamp),
    z.instanceof(FieldPath),
  ]),

  updated_at: z.union([
    z.date(),
    z.instanceof(Timestamp),
    z.instanceof(FieldPath),
  ]),
});

export const tableSchema = tableSchemaBase.superRefine((table, ctx) => {
  if (table.occupied_seats > table.capacity) {
    ctx.addIssue({
      code: "custom",
      message: "No more seats available",
      path: ["occupied_seats"],
    });
  }
});

export const createTableDocument = async ({
  table_number,
  capacity = 4,
  section = null,
  status = "available",
}: {
  table_number: number;
  capacity?: number;
  section?: string | null;
  status?: Table["status"];
}) => {
  const existing = await tableCollections
    .where("table_number", "==", table_number)
    .limit(1)
    .get();

  if (!existing.empty) {
    throw new AppError(HTTP_STATUS.CONFLICT, "Table number already exists");
  }

  const ref = tableCollections.doc();

  const tableData: UnwrapSchema<typeof tableSchemaBase> = {
    id: ref.id,
    table_number,
    capacity,
    status,
    occupied_seats: 0,
    current_orders: [],
    section,
    reserved_for: null,
    created_at: FieldValue.serverTimestamp(),
    updated_at: FieldValue.serverTimestamp(),
  };

  await ref.set(tableData);

  const createdDoc = await ref.get();

  return createdDoc.data() as Table;
};

export const getTableById = async (id: string) => {
  const doc = await tableCollections.doc(id).get();

  if (!doc.exists) return null;

  return doc.data() as Table;
};

export const getTableByNumber = async (tableNumber: number) => {
  const snapshot = await tableCollections
    .where("table_number", "==", tableNumber)
    .limit(1)
    .get();

  if (snapshot.empty) return null;

  return snapshot.docs.at(0)?.data() as Table;
};

export const getAllTables = async () => {
  const snapshot = await tableCollections.get();

  return snapshot.docs.map((doc) => ({
    ...doc.data(),
  })) as Table[];
};

export const updateTableById = async (
  id: string,
  data: Partial<
    Pick<
      Table,
      | "table_number"
      | "capacity"
      | "status"
      | "current_orders"
      | "section"
      | "reserved_for"
    >
  >,
) => {
  await tableCollections.doc(id).update({
    ...data,
    updated_at: FieldValue.serverTimestamp(),
  });

  const updated = await tableCollections.doc(id).get();

  return updated.data() as Table;
};

export const reserveTable = async (
  id: string,
  reservation: NonNullable<Table["reserved_for"]>,
) => {
  return await updateTableById(id, {
    status: "reserved",
    reserved_for: reservation,
  });
};

export const updateReservation = async (
  id: string,
  reservation: Partial<NonNullable<Table["reserved_for"]>>,
) => {
  const table = await getTableById(id);

  if (!table?.reserved_for) {
    throw new Error("Table is not reserved");
  }

  return await updateTableById(id, {
    status: "reserved",
    reserved_for: {
      ...table.reserved_for,
      ...reservation,
    },
  });
};

export const unreserveTable = async (id: string) => {
  return await updateTableById(id, {
    status: "available",
    reserved_for: null,
  });
};

export const assignOrderToTable = async (id: string, orderId: string) => {
  const table = await getTableById(id);

  if (table?.occupied_seats == table?.capacity) {
    throw new AppError(HTTP_STATUS.CONFLICT, "Table is already occupied");
  }

  if (table?.status !== "available") {
    throw new AppError(HTTP_STATUS.CONFLICT, "Table is not available");
  }

  return await updateTableById(id, {
    status: "occupied",
    current_orders: [...(table?.current_orders || []), orderId],
  });
};

export const clearTable = async (id: string) => {
  return await updateTableById(id, {
    status: "available",
    current_orders: [],
    reserved_for: null,
  });
};

export const updateTableSchema = z.object({
  table_number: z.number().int().positive().optional(),
  capacity: z.number().int().min(1).optional(),
  section: z.string().nullable().optional(),
  status: z.enum(tableStatuses).optional(),
});

export const TableModel = {
  createTable: tableSchemaBase.pick({
    table_number: true,
    capacity: true,
    section: true,
    status: true,
  }),

  updateTable: updateTableSchema.extend({
    id: z.string(),
  }),

  getAllTables: z.object({
    limit: z.coerce
      .number()
      .int()
      .positive()
      .optional()
      .default(10)
      .refine(
        (val) => [10, 25, 50].includes(val),
        "Limit must be 10, 25 or 50",
      ),
    cursor: z.coerce.number().int().positive().optional().default(0),
    status: z
      .enum([...tableStatuses, "all"])
      .optional()
      .default("all"),
    section: z.string().optional(),
  }),
};

export type TableModel = {
  [k in keyof typeof TableModel]: UnwrapSchema<(typeof TableModel)[k]>;
};

export type Table = z.infer<typeof tableSchema>;
