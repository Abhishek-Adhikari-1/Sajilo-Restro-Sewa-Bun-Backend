import Elysia from "elysia";
import type { UserRole } from "../types/auth";
import { authPlugin } from "./auth-plugin";
import { AppError } from "../utils/app-error";
import { HTTP_STATUS } from "../utils/http-status";

export const authorizationPlugin = new Elysia({
  name: "authorization",
})
  .use(authPlugin)
  .macro({
    restrictTo(roles: UserRole[]) {
      return {
        beforeHandle({ user }) {
          if (!roles.includes(user.role)) {
            throw new AppError(
              HTTP_STATUS.FORBIDDEN,
              "You are not authorized.",
            );
          }
        },
      };
    },
  });
