import { z } from "zod";
import { db } from "../../config/firebase";
import { userRoles, type UserRole } from "../../types/auth";
import { FieldPath, FieldValue, Timestamp } from "firebase-admin/firestore";

export const usersCollection = db.collection("users");

export const userSchema = z.object({
  uid: z.string(),
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
  email: z.email("Invalid email address").trim().toLowerCase(),
  avatar_url: z.url("Invalid avatar URL").nullable().default(null),
  role: z.enum(userRoles).default("waiter"),
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

// export const userUpdateSchema = z.object({
//   name: z.string().min(2).max(50).optional(),
//   avatar_url: z.url().nullable().optional(),
//   role: z.enum(userRoles).optional(),
//   is_active: z.boolean().optional(),
// });

export const userUpdateSchema = userSchema.pick({
  name: true,
  avatar_url: true,
  role: true,
  is_active: true,
})

export const createUserDocument = async ({
  uid,
  name,
  email,
  role = "waiter",
  avatar_url = null,
  is_active = true,
}: {
  uid: string;
  name: string;
  email: string;
  role?: UserRole;
  avatar_url?: string | null;
  is_active?: boolean;
}) => {
  const userData: User = {
    uid,
    name,
    email: email.toLowerCase().trim(),
    role,
    avatar_url,
    is_active,
    created_at: FieldValue.serverTimestamp(),
    updated_at: FieldValue.serverTimestamp(),
  };

  await usersCollection.doc(uid).set(userData);

  return userData;
};

export const getUserById = async (uid: string) => {
  const doc = await usersCollection.doc(uid).get();

  if (!doc.exists) return null;

  return doc.data() as User;
};

export const updateUserById = async (uid: string, data: UserUpdate) => {
  const payload = {
    ...data,
    updated_at: FieldValue.serverTimestamp(),
  };

  await usersCollection.doc(uid).update(payload);

  const updatedUser = await usersCollection.doc(uid).get();

  return updatedUser.data() as User;
};

// export const deleteUserById = async (uid: string) => {
//   await usersCollection.doc(uid).delete();

//   return {
//     success: true,
//   };
// };

export type User = z.infer<typeof userSchema>;

export type UserUpdate = z.infer<typeof userUpdateSchema>;
