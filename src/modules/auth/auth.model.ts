import type { UnwrapSchema } from "elysia";
import * as z from "zod";

export const AuthModel = {
  signInBody: z.object({
    email: z.email({ error: "Invalid email format" }),
    password: z.string(),
  }),
  signUpBody: z.object({
    email: z.email({ error: "Invalid email format" }),
    password: z.string(),
  }),
};

export type AuthModel = {
  [k in keyof typeof AuthModel]: UnwrapSchema<(typeof AuthModel)[k]>;
};
