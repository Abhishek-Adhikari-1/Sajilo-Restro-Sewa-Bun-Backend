import { type UnwrapSchema } from "elysia";
import { z } from "zod";
import { userRoleEnum } from "../../db";

export const registerBodySchema = z.object({
  firstName: z
    .string()
    .trim()
    .nonempty("First name is required")
    .min(1, "First name is required")
    .max(50, "First name must be at most 50 characters")
    .regex(/^[a-zA-Z]+$/, "First name must only contain letters")
    .toLowerCase()
    .transform((name) => name.charAt(0).toUpperCase() + name.slice(1)),

  lastName: z
    .string()
    .trim()
    .nonempty("Last name is required")
    .min(1, "Last name is required")
    .max(50, "Last name must be at most 50 characters")
    .regex(/^[a-zA-Z]+$/, "Last name must only contain letters")
    .toLowerCase()
    .transform((name) => name.charAt(0).toUpperCase() + name.slice(1)),

  role: z.enum(userRoleEnum.enumValues).default("waiter"),

  email: z.email("Please provide a valid email address").max(255).toLowerCase(),

  password: z
    .string()
    .nonempty("Password is required")
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be at most 128 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number",
    ),
});

export const loginBodySchema = z.object({
  email: z.email("Please provide a valid email address"),
  password: z.string().nonempty("Password is required"),
});

export const verifyEmailBodySchema = z.object({
  token: z.string().min(1, "Verification token is required"),
});

export const resendVerificationBodySchema = z.object({
  email: z.email("Please provide a valid email address"),
});

export const refreshTokenBodySchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

export const forgotPasswordBodySchema = z.object({
  email: z.email("Please provide a valid email address"),
});

export const resetPasswordBodySchema = z
  .object({
    token: z.string().min(1, "Reset token is required"),
    email: z.email("Please provide a valid email address"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128, "Password must be at most 128 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number",
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const AuthModel = {
  registerBody: registerBodySchema,
  loginBody: loginBodySchema,
  verifyEmailBody: verifyEmailBodySchema,
  resendVerificationBody: resendVerificationBodySchema,
  refreshTokenBody: refreshTokenBodySchema,
  forgotPasswordBody: forgotPasswordBodySchema,
  resetPasswordBody: resetPasswordBodySchema,
  userRegister: registerBodySchema.omit({ password: true }).extend({ imageId: z.string().uuid().optional() }),
};

export type AuthModel = {
  [k in keyof typeof AuthModel]: UnwrapSchema<(typeof AuthModel)[k]>;
};
