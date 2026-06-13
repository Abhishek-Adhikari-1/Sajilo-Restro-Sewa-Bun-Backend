import Elysia from "elysia";
import { AuthModel } from "./auth.model";
import { authPlugin, tokenAuthPlugin } from "../../middleware/auth.plugin";
import { AuthService } from "./auth.service";
import { HTTP_STATUS } from "../../utils/http-status";
import { authorizationPlugin } from "../../middleware/authorization-plugin";
import { UserService } from "../user/user.service";
import { UserRepo } from "../user/user.repository";
import { email } from "zod";

const router = new Elysia({
  name: "auth-router",
  prefix: "/auth",
  tags: ["Auth"],
});

// ─── Public routes ────────────────────────────────────────────────────────────

// router.post(
//   "/register",
//   async ({ body }) => {
//     const result = await UserService.createUser({
//       firstName: body.firstName,
//       lastName: body.lastName,
//       email: body.email,
//       role: body.role as any,
//       imageId: body.imageId,
//     });
//     return {
//       message: "Staff member created successfully",
//       data: result.user,
//       generatedPassword: result.generatedPassword,
//     };
//   },
//   {
//     body: AuthModel.registerBody,
//     detail: { summary: "Register a new user" },
//   },
// );

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

// ─── Private routes ────────────────────────────────────────────────────────────

router
  .use(tokenAuthPlugin)
  .post(
    "/resend-verification",
    async ({ user }) => {
      const result = await AuthService.resendVerificationEmail({
        email: user.email,
      });
      return result;
    },
    {
      detail: { summary: "Resend email verification" },
    },
  )
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
  )
  .get(
    "/sessions",
    async ({ user, session }) => {
      const sessions = await AuthService.getUserSessions(user.id, session.id);
      return { sessions };
    },
    {
      detail: { summary: "Get all active sessions for current user" },
    },
  )
  .delete(
    "/sessions",
    async ({ user }) => {
      const result = await AuthService.logoutAll({ userId: user.id });
      return result;
    },
    {
      detail: { summary: "Logout from all devices" },
    },
  );

router
  .use(authPlugin)
  .use(authorizationPlugin)
  .post(
    "/user-register",
    async ({ body }) => {
      const rawPassword = crypto.randomUUID().substring(0, 12);
      await AuthService.register({
        email: body.email,
        firstName: body.firstName,
        lastName: body.lastName,
        password: rawPassword,
        role: body.role,
      });
      
      const user = await UserRepo.findUserByEmail(body.email);
      
      return {
        message: "Staff member created successfully. An email has been sent with their credentials.",
        data: user,
      };
    },
    {
      body: AuthModel.userRegister,
      restrictTo: ["admin"],
      detail: { summary: "Register a new user" },
    },
  );

export { router as auth_router };
