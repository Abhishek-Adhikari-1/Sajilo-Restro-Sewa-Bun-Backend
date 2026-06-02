import { z } from "zod";
import { db } from "../../config/firebase";
import { FieldPath, FieldValue, Timestamp } from "firebase-admin/firestore";
import { AppError } from "../../utils/app-error";
import { HTTP_STATUS } from "../../utils/http-status";

export const categoryCollections = db.collection("categories");

export const categorySchema = z.object({
  id: z.string(),
  name: z
    .string()
    .min(2, "Name is required")
    .max(50)
    .trim()
    .transform((val) =>
      val
        .toLowerCase()
        .split(" ")
        .filter(Boolean)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" "),
    ),
  icon: z.string().nullable().default(null),
  description: z.string().nullable().default(null),
  is_active: z.boolean().default(true),

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

export const createCategoryDocument = async ({
  name,
  icon = null,
  description = null,
  is_active = true,
}: {
  name: string;
  icon?: string | null;
  description?: string | null;
  is_active?: boolean;
}) => {
  const existing = await categoryCollections
    .where("name", "==", name)
    .limit(1)
    .get();

  if (!existing.empty) {
    throw new AppError(HTTP_STATUS.CONFLICT, "Category already exists");
  }

  const ref = categoryCollections.doc();

  const categoryData = {
    id: ref.id,
    name,
    icon,
    description,
    is_active,
    created_at: FieldValue.serverTimestamp(),
    updated_at: FieldValue.serverTimestamp(),
  };

  await ref.set(categoryData);

  return categoryData;
};

export const getCategoryById = async (id: string) => {
  const doc = await categoryCollections.doc(id).get();

  if (!doc.exists) {
    return null;
  }

  return doc.data() as Category;
};

export const getAllCategories = async () => {
  const snapshot = await categoryCollections.get();

  return snapshot.docs.map((doc) => ({
    ...doc.data(),
  })) as Category[];
};

export const getCategoryByName = async (name: string) => {
  const snapshot = await categoryCollections
    .where("name", "==", name)
    .limit(1)
    .get();

  if (snapshot.empty) {
    return null;
  }

  return snapshot.docs.at(0)?.data() as Category;
};

export const updateCategoryById = async (id: string, data: CategoryUpdate) => {
  if (data.name) {
    const existing = await categoryCollections
      .where("name", "==", data.name)
      .limit(1)
      .get();

    const duplicate = existing.docs.find((doc) => doc.id !== id);

    if (duplicate) {
      throw new AppError(HTTP_STATUS.CONFLICT, "Category already exists");
    }
  }

  await categoryCollections.doc(id).update({
    ...data,
    updated_at: FieldValue.serverTimestamp(),
  });

  const updated = await categoryCollections.doc(id).get();

  return updated.data() as Category;
};

export type Category = z.infer<typeof categorySchema>;

export type CategoryUpdate = Partial<
  Pick<Category, "name" | "icon" | "description" | "is_active">
>;
