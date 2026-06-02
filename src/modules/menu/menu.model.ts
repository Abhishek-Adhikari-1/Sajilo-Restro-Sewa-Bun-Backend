import { z } from "zod";
import { db } from "../../config/firebase";
import { FieldPath, FieldValue, Timestamp } from "firebase-admin/firestore";
import { AppError } from "../../utils/app-error";
import { HTTP_STATUS } from "../../utils/http-status";
import {
  categoryCollections,
  getCategoryById,
} from "../category/category.model";

export const menuCollections = db.collection("menus");

export const menuSchema = z.object({
  id: z.string(),
  name: z
    .string()
    .min(2, "Name is required")
    .max(80)
    .trim()
    .transform((val) =>
      val
        .toLowerCase()
        .split(" ")
        .filter(Boolean)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" "),
    ),
  description: z.string().nullable().default(null),
  price: z.number().min(0).default(0),
  category_id: z.string().nullable().default(null),
  image: z.string().nullable().default(null),
  is_available: z.boolean().default(true),
  estimated_preparation_time: z.number().min(0).default(0),

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

export const createMenuDocument = async ({
  name,
  description = null,
  price,
  category = null,
  image = null,
  is_available = true,
  estimated_preparation_time = 0,
}: {
  name: string;
  description?: string | null;
  price: number;
  category?: string | null;
  image?: string | null;
  is_available?: boolean;
  estimated_preparation_time?: number;
}) => {
  const existing = await menuCollections
    .where("name", "==", name)
    .limit(1)
    .get();

  if (!existing.empty) {
    throw new AppError(HTTP_STATUS.CONFLICT, "Menu item already exists");
  }

  const ref = menuCollections.doc();

  const menuData = {
    id: ref.id,
    name,
    description,
    price,
    category,
    image,
    is_available,
    estimated_preparation_time,

    created_at: FieldValue.serverTimestamp(),
    updated_at: FieldValue.serverTimestamp(),
  };

  await ref.set(menuData);

  return menuData;
};

export const getMenuById = async (id: string) => {
  const doc = await menuCollections.doc(id).get();

  if (!doc.exists) {
    return null;
  }

  return doc.data() as Menu;
};

export const getAllMenus = async () => {
  const snapshot = await menuCollections.get();

  return snapshot.docs.map((doc) => ({
    ...doc.data(),
  })) as Menu[];
};

export const updateMenuById = async (id: string, data: MenuUpdate) => {
  if (data.name) {
    const existing = await menuCollections
      .where("name", "==", data.name)
      .limit(1)
      .get();

    const duplicate = existing.docs.find((doc) => doc.id !== id);

    if (duplicate) {
      throw new AppError(HTTP_STATUS.CONFLICT, "Menu item already exists");
    }
  }

  await menuCollections.doc(id).update({
    ...data,
    updated_at: FieldValue.serverTimestamp(),
  });

  const updated = await menuCollections.doc(id).get();

  return updated.data() as Menu;
};

export const searchMenus = async (query: string) => {
  const search = query.toLowerCase().trim();

  const [menuSnapshot, categorySnapshot] = await Promise.all([
    menuCollections.get(),
    categoryCollections.get(),
  ]);

  const categories = categorySnapshot.docs.map((doc) => doc.data());

  const matchedCategories = categories
    .filter((category) => category.name?.toLowerCase().includes(search))
    .map((category) => category.name);

  const menus = menuSnapshot.docs.map((doc) => doc.data() as Menu);

  return menus.filter((menu) => {
    const menuMatch = menu.name.toLowerCase().includes(search);

    const categoryMatch =
      menu.category_id && matchedCategories.includes(menu.category_id);

    return menuMatch || categoryMatch;
  });
};

export const getMenusByCategory = async (category: string) => {
  const categoryDoc = await getCategoryById(category);

  const categoryName = categoryDoc?.name ?? category;

  const snapshot = await menuCollections
    .where("category", "==", categoryName)
    .get();

  return snapshot.docs.map((doc) => doc.data() as Menu);
};

export const getAvailableMenusByCategory = async (category: string) => {
  const snapshot = await menuCollections
    .where("category", "==", category)
    .where("is_available", "==", true)
    .get();

  return snapshot.docs.map((doc) => doc.data() as Menu);
};

export type Menu = z.infer<typeof menuSchema>;

export type MenuUpdate = Partial<
  Pick<
    Menu,
    | "name"
    | "description"
    | "price"
    | "category_id"
    | "image"
    | "is_available"
    | "estimated_preparation_time"
  >
>;
