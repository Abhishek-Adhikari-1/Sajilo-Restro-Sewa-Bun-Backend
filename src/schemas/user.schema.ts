import { z } from "zod";
import {
  Timestamp,
  type DocumentData,
  QueryDocumentSnapshot,
} from "firebase-admin/firestore";
import { db } from "../config/firebase";

// 1. Runtime Validation Schema (Validates incoming request body)
export const userCreateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.email("Invalid email format"),
});

// 2. Compile-Time Type Definition (The exact shape in Firestore)
export type User = z.infer<typeof userCreateSchema> & {
  createdAt: Date | Timestamp;
};

// 3. Firestore Data Converter (The Architecture Layer)
// This intercepts all reads/writes to ensure the data strictly matches the User type.
export const userConverter = {
  toFirestore(user: User): DocumentData {
    return {
      name: user.name,
      email: user.email,
      created_at: user.createdAt,
    };
  },
  fromFirestore(snapshot: QueryDocumentSnapshot): User {
    const data = snapshot.data();
    return {
      name: data.name,
      email: data.email,
      createdAt: data.created_at,
    };
  },
};

export const usersCollection = db
  .collection("users")
  .withConverter(userConverter);
