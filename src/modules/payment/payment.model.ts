import { z } from "zod";
import { db } from "../../config/firebase";
import { FieldPath, FieldValue, Timestamp } from "firebase-admin/firestore";
import { AppError } from "../../utils/app-error";
import { HTTP_STATUS } from "../../utils/http-status";
import { paymentMethods, paymentStatuses } from "../../types/payment";

export const paymentsCollection = db.collection("payments");

export const paymentSchema = z.object({
  id: z.string(),
  order_id: z.string(),
  customer_id: z.string(),
  amount: z.number().min(0),
  discount: z.object({
    type: z.enum(["percentage", "fixed"]),
    value: z.number().min(0).default(0),
  }),
  tax: z.object({
    type: z.enum(["percentage", "fixed"]),
    value: z.number().min(0).default(0),
  }),
  method: z.enum(paymentMethods).default("cash"),
  status: z.enum(paymentStatuses).default("pending"),
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

export const createPaymentDocument = async ({
  order_id,
  customer_id,
  amount,
  discount = {
    type: "fixed",
    value: 0,
  },
  tax = {
    type: "fixed",
    value: 0,
  },
  method = "cash",
  status = "pending",
  notes = null,
  created_by,
}: {
  order_id: string;
  customer_id: string;
  amount: number;
  discount?: Payment["discount"];
  tax?: Payment["tax"];
  method?: Payment["method"];
  status?: Payment["status"];
  notes?: string | null;
  created_by: string;
}) => {
  const ref = paymentsCollection.doc();

  const paymentData = {
    id: ref.id,
    order_id,
    customer_id,
    amount,
    discount,
    tax,
    method,
    status,
    notes,
    created_by,

    created_at: FieldValue.serverTimestamp(),

    updated_at: FieldValue.serverTimestamp(),
  };

  await ref.set(paymentData);

  return paymentData;
};

export const getPaymentById = async (id: string) => {
  const doc = await paymentsCollection.doc(id).get();

  if (!doc.exists) {
    return null;
  }

  return doc.data() as Payment;
};

export const getAllPayments = async () => {
  const snapshot = await paymentsCollection.get();

  return snapshot.docs.map((doc) => doc.data() as Payment);
};

export const getPaymentsByOrderId = async (orderId: string) => {
  const snapshot = await paymentsCollection
    .where("order_id", "==", orderId)
    .get();

  return snapshot.docs.map((doc) => doc.data() as Payment);
};

export const getPaymentsByCustomerId = async (customerId: string) => {
  const snapshot = await paymentsCollection
    .where("customer_id", "==", customerId)
    .get();

  return snapshot.docs.map((doc) => doc.data() as Payment);
};

export const updatePaymentById = async (id: string, data: PaymentUpdate) => {
  await paymentsCollection.doc(id).update({
    ...data,
    updated_at: FieldValue.serverTimestamp(),
  });

  const updated = await paymentsCollection.doc(id).get();

  return updated.data() as Payment;
};

export const updatePaymentStatus = async (
  id: string,
  status: Payment["status"],
) => {
  return await updatePaymentById(id, { status });
};

export type Payment = z.infer<typeof paymentSchema>;

export type PaymentUpdate = Partial<
  Pick<Payment, "status" | "amount" | "discount" | "notes" | "method" | "tax">
>;
