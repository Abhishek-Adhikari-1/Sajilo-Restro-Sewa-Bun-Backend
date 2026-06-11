import Elysia from "elysia";
import { AppError } from "../utils/app-error";
import { HTTP_STATUS } from "../utils/http-status";
import { authPlugin } from "./auth.plugin";
import { users } from "../db";

type UserRole = (typeof users.role.enumValues)[number];

export const authorizationPlugin = new Elysia({
  name: "authorization",
})
  .use(authPlugin)
  .macro({
    restrictTo(roles: UserRole[] | "*") {
      return {
        beforeHandle({ user }) {
          if (roles === "*" && users.role.enumValues.includes(user.role))
            return;

          if (roles.includes(user.role)) return;

          throw new AppError(HTTP_STATUS.FORBIDDEN, "You are not authorized.");
        },
      };
    },
  });
