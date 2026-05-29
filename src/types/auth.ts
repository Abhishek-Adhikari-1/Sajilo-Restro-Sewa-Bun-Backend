import { env } from "../config/env";

export const userRoles = ["waiter", "kitchen", "cashier", "admin"] as const;

export type UserRole = (typeof userRoles)[number];

export const APPURL = new URL(`https://${env.FIREBASE_PROJECT_ID}.firebaseapp.com`);


