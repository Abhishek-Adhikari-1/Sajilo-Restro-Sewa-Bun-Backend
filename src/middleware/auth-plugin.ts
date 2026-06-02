import admin from "firebase-admin";
import { AppError } from "../utils/app-error";
import { HTTP_STATUS } from "../utils/http-status";
import { getUserById } from "../modules/user/user.model";
import Elysia from "elysia";

export const authPlugin = new Elysia({ name: "auth" }).derive(
  { as: "global" },
  async ({ headers }) => {
    try {
      const authorization = headers.authorization ?? "";
      const auth = admin.auth();

      if (!authorization?.startsWith("Bearer ")) {
        throw new AppError(
          HTTP_STATUS.UNAUTHORIZED,
          "Authentication required.",
        );
      }

      const token = authorization.split(" ")[1] ?? "";

      const decoded = await auth.verifyIdToken(token, true);

      const userRecord = await auth.getUser(decoded.uid);

      if (userRecord.disabled) {
        throw new AppError(
          HTTP_STATUS.FORBIDDEN,
          "This account has been disabled.",
        );
      }

      if (!userRecord.emailVerified) {
        throw new AppError(
          HTTP_STATUS.FORBIDDEN,
          "Please verify your email address.",
        );
      }

      const userDoc = await getUserById(decoded.uid);

      if (!userDoc?.is_active) {
        throw new AppError(HTTP_STATUS.FORBIDDEN, "Account is not active.");
      }

      return {
        user: userDoc,
        userRecord: userRecord,
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError(HTTP_STATUS.UNAUTHORIZED, "Invalid or expired token.");
    }
  },
);
