import type { UnwrapSchema } from "elysia";
import * as z from "zod";
import { userSchema } from "../user/user.model";

export const AuthModel = {
  signInBody: userSchema.pick({ email: true }).extend({ password: z.string() }),
  signUpBody: userSchema.pick({ email: true, name: true, role: true }).extend({
    password: z
      .string()
      .min(8, "Password must contain at least 8 characters")
      .regex(/[a-z]/, "Password must contain a lower case character")
      .regex(/[A-Z]/, "Password must contain an upper case character")
      .regex(
        /[^a-zA-Z0-9]/,
        "Password must contain a non-alphanumeric character",
      ),
    role: userSchema.shape.role.optional(),
  }),
};

export type AuthModel = {
  [k in keyof typeof AuthModel]: UnwrapSchema<(typeof AuthModel)[k]>;
};
