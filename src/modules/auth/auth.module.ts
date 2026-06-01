import Elysia, { t } from "elysia";
import { db } from "../../config/firebase";
import { AuthModel } from "./auth.model";
import { Auth } from "./auth.service";
import { authPlugin } from "../../middleware/auth-middleware";

const router = new Elysia({
  name: "auth-router",
  prefix: "/auth",
});

router.post(
  "/login",
  async ({ body }) => {
    const res = await Auth.signIn({
      email: body.email,
      password: body.password,
    });

    return {
      message: "User logged in successfully",
      ...res,
    };
  },
  {
    body: AuthModel["signInBody"],
  },
);

router.post(
  "/register",
  async ({ body }) => {
    const res = await Auth.signUp({
      email: body.email,
      password: body.password,
      name: body.name,
      role: body.role,
    });

    return {
      message: "User registered successfully",
      ...res,
    };
  },
  {
    body: AuthModel["signUpBody"],
  },
);

router.get(
  "/refresh",
  async ({ query }) => {
    const res = await Auth.refreshToken({
      refreshToken: query.refreshToken,
    });

    return {
      message: "Token refreshed successfully",
      ...res,
    };
  },
  {
    query: AuthModel["refreshTokenBody"],
  },
);

router.group("", (app) =>
  app.use(authPlugin).get("/me", ({ user, userRecord }) => {
    return {
      message: "Profile fetched successfully",
      name: user.name,
      email: user.email,
      role: user.role,
      uid: user.uid,
      avatar_url: user.avatar_url,
      is_active: user.is_active,
      emailVerified: userRecord.emailVerified,
      disabled: userRecord.disabled,
      updated_at: user.updated_at,
      metadata: {
        lastSignInTime: userRecord.metadata.lastSignInTime,
        creationTime: userRecord.metadata.creationTime,
        lastRefreshTime: userRecord.metadata.lastRefreshTime,
      },
    };
  }),
);

export { router as auth_router };
