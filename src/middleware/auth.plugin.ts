import Elysia from "elysia";
import { AppError } from "../utils/app-error";
import { HTTP_STATUS } from "../utils/http-status";
import { AuthService } from "../modules/auth/auth.service";

export const authPlugin = new Elysia({ name: "auth-plugin" }).derive(
  { as: "global" },
  async ({ request }) => {
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError(
        HTTP_STATUS.UNAUTHORIZED,
        "Authentication required. Send: Authorization: Bearer <session_token>",
      );
    }

    const sessionToken = authHeader.slice(7).trim();

    if (!sessionToken) {
      throw new AppError(HTTP_STATUS.UNAUTHORIZED, "Session token is missing.");
    }

    const result = await AuthService.getSessionUser(sessionToken);

    if (!result) {
      throw new AppError(
        HTTP_STATUS.UNAUTHORIZED,
        "Session expired or invalid. Please log in again.",
      );
    }

    if (!result.user.emailVerified) {
      throw new AppError(
        HTTP_STATUS.FORBIDDEN,
        "Please verify your email address before logging in.",
      );
    }
    if (result.user.status === "disabled") {
      throw new AppError(
        HTTP_STATUS.FORBIDDEN,
        "Your account has been disabled. Please contact support.",
      );
    }
    if (result.user.status === "suspended") {
      throw new AppError(
        HTTP_STATUS.FORBIDDEN,
        "Your account is temporarily suspended.",
      );
    }
    if (result.user.status === "inactive") {
      throw new AppError(HTTP_STATUS.FORBIDDEN, "Your account is not active.");
    }

    return {
      user: result.user,
      session: result.session,
    };
  },
);

export const tokenAuthPlugin = new Elysia({ name: "token-auth-plugin" }).derive(
  { as: "global" },
  async ({ request }) => {
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError(
        HTTP_STATUS.UNAUTHORIZED,
        "Authentication required. Send: Authorization: Bearer <session_token>",
      );
    }

    const sessionToken = authHeader.slice(7).trim();

    if (!sessionToken) {
      throw new AppError(HTTP_STATUS.UNAUTHORIZED, "Session token is missing.");
    }

    const result = await AuthService.getSessionUser(sessionToken);

    if (!result) {
      throw new AppError(
        HTTP_STATUS.UNAUTHORIZED,
        "Session expired or invalid. Please log in again.",
      );
    }

    return {
      user: result.user,
      session: result.session,
    };
  },
);
