import Elysia from "elysia";
import { AuthModel } from "./auth.model";
import { authPlugin } from "../../middleware/auth.plugin";
import { AuthService } from "./auth.service";
import { HTTP_STATUS } from "../../utils/http-status";

const router = new Elysia({
  name: "auth-router",
  prefix: "/auth",
  tags: ["Auth"],
});

// ─── Public routes ────────────────────────────────────────────────────────────

router.post(
  "/register",
  async ({ body, set }) => {
    const result = await AuthService.register({
      email: body.email,
      firstName: body.firstName,
      lastName: body.lastName,
      password: body.password,
    });
    set.status = HTTP_STATUS.CREATED;
    return result;
  },
  {
    body: AuthModel.registerBody,
    detail: { summary: "Register a new user" },
  },
);

router.post(
  "/login",
  async ({ body, request }) => {
    const userAgent = request.headers.get("user-agent") ?? undefined;
    const ipAddress = request.headers.get("x-forwarded-for") ?? undefined;

    const result = await AuthService.login({
      email: body.email,
      password: body.password,
      userAgent: userAgent,
      ipAddress: ipAddress,
    });
    return result;
  },
  {
    body: AuthModel.loginBody,
    detail: { summary: "Login with email and password" },
  },
);

router.post(
  "/verify-email",
  async ({ body }) => {
    const result = await AuthService.verifyEmail({
      token: body.token,
    });
    return result;
  },
  {
    body: AuthModel.verifyEmailBody,
    detail: { summary: "Verify email address" },
  },
);

router.post(
  "/resend-verification",
  async ({ body }) => {
    const result = await AuthService.resendVerificationEmail({
      email: body.email,
    });
    return result;
  },
  {
    body: AuthModel.resendVerificationBody,
    detail: { summary: "Resend email verification" },
  },
);

// ─── Private routes ────────────────────────────────────────────────────────────

router
  .use(authPlugin)
  .post(
    "/logout",
    async ({ session }) => {
      const result = await AuthService.logout({
        sessionId: session.id,
      });
      return result;
    },
    {
      detail: { summary: "Logout current session" },
    },
  )
  .post(
    "/logout-all",
    async ({ session, user }) => {
      const result = await AuthService.logoutAllExcept({
        userId: user.id,
        sessionId: session.id,
      });
      return result;
    },
    {
      detail: { summary: "Logout from all devices" },
    },
  )
  .get(
    "/me",
    async ({ user }) => {
      return {
        user,
      };
    },
    {
      detail: { summary: "Get current authenticated user" },
    },
  );

export { router as auth_router };
