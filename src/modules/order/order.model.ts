import { z } from "zod";
import { db } from "../../config/firebase";
import { FieldPath, FieldValue, Timestamp } from "firebase-admin/firestore";
import { AppError } from "../../utils/app-error";
import { HTTP_STATUS } from "../../utils/http-status";
import { orderStatuses } from "../../types/order";

export const ordersCollection = db.collection("orders");

export const orderSchema = z.object({
  id: z.string(),
  table_id: z.string(),
  status: z.enum(orderStatuses).default("pending"),
  items: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      price: z.number().min(0),
      quantity: z.number().int().positive(),
      special_instructions: z.string().nullable().default(null),
    }),
  ),
  notes: z.string().nullable().default(null),
  created_by: z.string(),

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

export const createOrderDocument = async ({
  table_id,
  items,
  notes = null,
}: {
  table_id: string;
  items: Order["items"];
  notes?: string | null;
}) => {
  const ref = ordersCollection.doc();

  const orderData = {
    id: ref.id,
    table_id,
    status: "pending" as const,
    items,
    notes,
    created_at: FieldValue.serverTimestamp(),
    updated_at: FieldValue.serverTimestamp(),
  };

  await ref.set(orderData);

  return orderData;
};

export const getOrderById = async (id: string) => {
  const doc = await ordersCollection.doc(id).get();

  if (!doc.exists) {
    return null;
  }

  return doc.data() as Order;
};

export const getAllOrders = async () => {
  const snapshot = await ordersCollection.get();

  return snapshot.docs.map((doc) => doc.data() as Order);
};

export const getOrdersByTableId = async (tableId: string) => {
  const snapshot = await ordersCollection
    .where("table_id", "==", tableId)
    .get();

  return snapshot.docs.map((doc) => doc.data() as Order);
};

export const updateOrderById = async (id: string, data: OrderUpdate) => {
  await ordersCollection.doc(id).update({
    ...data,
    updated_at: FieldValue.serverTimestamp(),
  });

  const updated = await ordersCollection.doc(id).get();

  return updated.data() as Order;
};

export const updateOrderStatus = async (
  id: string,
  status: Order["status"],
) => {
  return await updateOrderById(id, { status });
};

export const addItemToOrder = async (
  id: string,
  item: Order["items"][number],
) => {
  const order = await getOrderById(id);

  if (!order) {
    throw new AppError(HTTP_STATUS.NOT_FOUND, "Order not found");
  }

  const existingItem = order.items.find((i) => i.id === item.id);

  let items: Order["items"];

  if (existingItem) {
    items = order.items.map((i) =>
      i.id === item.id
        ? {
            ...i,
            quantity: i.quantity + item.quantity,
          }
        : i,
    );
  } else {
    items = [...order.items, item];
  }

  return await updateOrderById(id, { items });
};

export const removeItemFromOrder = async (id: string, itemId: string) => {
  const order = await getOrderById(id);

  if (!order) {
    throw new AppError(HTTP_STATUS.NOT_FOUND, "Order not found");
  }

  const items = order.items.filter((item) => item.id !== itemId);

  return await updateOrderById(id, { items });
};

export type Order = z.infer<typeof orderSchema>;

export type OrderUpdate = Partial<
  Pick<Order, "items" | "status" | "notes" | "table_id">
>;
