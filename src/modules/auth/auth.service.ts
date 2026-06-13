import { env } from "../../config/env";
import { db } from "../../config/db";
import { AppError } from "../../utils/app-error";
import { addDays, addHours, addMinutes, isExpired } from "../../utils/date";
import { Password } from "../../utils/hash";
import { HTTP_STATUS } from "../../utils/http-status";
import { sendEmail } from "../../utils/mailer";
import { generateAndHashToken, hashToken } from "../../utils/token";
import { AuthModel } from "./auth.model";
import { UserRepo } from "../user/user.repository";
import { AuthRepo } from "./auth.repository";

type RegisterService = AuthModel["registerBody"];

type LoginService = AuthModel["loginBody"] & {
  userAgent?: string;
  ipAddress?: string;
};

type VerifyEmailService = AuthModel["verifyEmailBody"];

type ResendVerificationService = AuthModel["resendVerificationBody"];

type LogoutService = {
  sessionId: string;
};

type LogoutAllExceptMeService = {
  sessionId: string;
  userId: string;
};

export abstract class AuthService {
  static async register({
    email,
    firstName,
    lastName,
    password,
    role,
  }: RegisterService): Promise<{ message: string, user: Awaited<ReturnType<typeof UserRepo.createUser>> }> {
    // 1. Check for existing email — fast path before transaction
    const existingUser = await UserRepo.findUserByEmail(email);

    if (existingUser) {
      await Password.hash("dummy_constant_time_work");
      throw new AppError(HTTP_STATUS.CONFLICT, "Email is already registered.");
    }

    // 2. Hash password
    const passwordHash = await Password.hash(password);
    var user: Awaited<ReturnType<typeof UserRepo.createUser>>;

    user = await db.transaction(async (tx) => {
      // 3. Create user
      user = await UserRepo.createUser(
        {
          firstName: firstName,
          lastName: lastName,
          email,
          status: "inactive",
          role,
        },
        tx,
      );

      // 4. Create email/password account record
      await UserRepo.createAccount(
        {
          userId: user.id,
          providerId: "credentials",
          password: passwordHash,
          accountId: user.id,
        },
        tx,
      );

      // 5. Generate email verification token
      const { hashed } = generateAndHashToken();
      const identifier = `userId:${user.id}`;

      // Delete any old tokens for this email (idempotent registration retry)
      await AuthRepo.deleteVerificationsByIdentifier(
        identifier,
        "email_verification",
        tx,
      );

      await AuthRepo.createVerification(
        {
          identifier,
          type: "email_verification",
          tokenHash: hashed,
          expiresAt: addHours(new Date(), env.EMAIL_VERIFICATION_EXPIRES_HOURS),
          metadata: { userId: user.id },
        },
        tx,
      );

      return user;
    });

    // 6. Send verification email
    // const verificationUrl = `${env.FRONTEND_URL}/auth/verify-email?token=${rawToken}&email=${encodeURIComponent(email)}`;
    sendEmail();

    return {
      message:
        "Registration successful. Please check your email to verify your account.",
        user: user
    };
  }

  static async login({ email, password, userAgent, ipAddress }: LoginService) {
    // 1. Find user with credentials account in a single query
    const user = await UserRepo.findUserWithAccount(email);

    // Always hash to prevent timing attacks — even if user doesn't exist
    const accountPassword = user?.accounts?.[0]?.password ?? null;
    const isValid = accountPassword
      ? await Password.verify(password, accountPassword)
      : await Password.hash("dummy_constant_time_work").then(() => false);

    if (!user || !isValid) {
      throw new AppError(
        HTTP_STATUS.UNAUTHORIZED,
        "Invalid email or password.",
      );
    }

    // 2. Status checks
    // if (!user.emailVerified) {
    //   throw new AppError(
    //     HTTP_STATUS.FORBIDDEN,
    //     "Please verify your email address before logging in.",
    //   );
    // }
    // if (user.status === "disabled") {
    //   throw new AppError(
    //     HTTP_STATUS.FORBIDDEN,
    //     "Your account has been disabled. Please contact support.",
    //   );
    // }
    // if (user.status === "suspended") {
    //   throw new AppError(
    //     HTTP_STATUS.FORBIDDEN,
    //     "Your account is temporarily suspended.",
    //   );
    // }
    // if (user.status === "inactive") {
    //   throw new AppError(HTTP_STATUS.FORBIDDEN, "Your account is not active.");
    // }

    // 3. Generate session token
    const { raw, hashed } = generateAndHashToken(64);

    const expiresAt = addDays(new Date(), env.SESSION_EXPIRES_DAYS);

    await AuthRepo.createSession({
      userId: user.id,
      token: hashed,
      expiresAt,
      userAgent,
      ipAddress,
    });

    return {
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        status: user.status,
        emailVerified: user.emailVerified,
        role: user.role,
        avatar: user.avatar?.url,
      },
      session: {
        token: raw,
        expiresAt,
      },
    };
  }

  static async verifyEmail({ token }: VerifyEmailService) {
    const tokenHash = hashToken(token);

    const verification = await AuthRepo.findVerificationByToken(
      tokenHash,
      "email_verification",
    );

    if (!verification) {
      throw new AppError(
        HTTP_STATUS.BAD_REQUEST,
        "Invalid or expired verification token.",
      );
    }

    if (isExpired(verification.expiresAt)) {
      await AuthRepo.deleteVerificationById(verification.id);
      throw new AppError(
        HTTP_STATUS.BAD_REQUEST,
        "Verification token has expired. Please request a new one.",
      );
    }

    // Extract userId from metadata
    const metadata = verification.metadata as { userId?: string } | null;
    const userId = metadata?.userId ?? verification.identifier.split(":")[1];

    if (!userId) {
      throw new AppError(
        HTTP_STATUS.NOT_FOUND,
        "Verification metadata is missing.",
      );
    }

    await UserRepo.markEmailVerified(userId);
    await AuthRepo.deleteVerificationById(verification.id);

    return { message: "Email verified successfully. You can now log in." };
  }

  static async resendVerificationEmail({ email }: ResendVerificationService) {
    // Always return the same message to prevent user enumeration
    const genericMessage =
      "If an account with that email exists and is unverified, a new verification link has been sent.";

    const user = await UserRepo.findUserByEmail(email);

    if (!user || user.emailVerified) {
      return { message: genericMessage };
    }

    if (user.status === "disabled") {
      return { message: genericMessage };
    }

    const { raw, hashed } = generateAndHashToken();
    const identifier = `userId:${user.id}`;

    await db.transaction(async (tx) => {
      await AuthRepo.deleteVerificationsByIdentifier(
        identifier,
        "email_verification",
        tx,
      );
      await AuthRepo.createVerification(
        {
          identifier,
          type: "email_verification",
          tokenHash: hashed,
          expiresAt: addHours(new Date(), env.EMAIL_VERIFICATION_EXPIRES_HOURS),
          metadata: { userId: user.id },
        },
        tx,
      );
    });

    // const verificationUrl = `${env.FRONTEND_URL}/auth/verify-email?token=${raw}&email=${encodeURIComponent(email)}`;
    sendEmail();

    return { message: genericMessage };
  }

  static async logout({ sessionId }: LogoutService) {
    await AuthRepo.deleteSessionById(sessionId);
    return { message: "Logged out successfully." };
  }

  static async getSessionUser(token: string) {
    const tokenHash = hashToken(token);

    const session = await AuthRepo.findSessionByToken(tokenHash);

    if (!session) {
      throw new AppError(HTTP_STATUS.UNAUTHORIZED, "Invalid session token.");
    }

    return {
      user: {
        id: session.user.id,
        firstName: session.user.firstName,
        lastName: session.user.lastName,
        email: session.user.email,
        status: session.user.status,
        emailVerified: session.user.emailVerified,
        role: session.user.role,
        image: session.user.avatar?.url || null,
        createdAt: session.user.createdAt,
        updatedAt: session.user.updatedAt,
      },
      session: {
        id: session.id,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
        userId: session.userId,
        token: session.token,
        expiresAt: session.expiresAt,
        userAgent: session.userAgent,
        ipAddress: session.ipAddress,
      },
    };
  }

  static async logoutAllExcept({
    sessionId,
    userId,
  }: LogoutAllExceptMeService) {
    await AuthRepo.deleteAllSessionsByUserIdExcept(userId, sessionId);
    return { message: "Logged out all other sessions successfully." };
  }

  static async getUserSessions(userId: string, currentSessionId: string) {
    const activeSessions = await AuthRepo.findSessionsByUserId(userId);
    return activeSessions.map((s) => ({
      id: s.id,
      userAgent: s.userAgent,
      ipAddress: s.ipAddress,
      createdAt: s.createdAt,
      expiresAt: s.expiresAt,
      isCurrent: s.id === currentSessionId,
    }));
  }

  static async logoutAll({ userId }: { userId: string }) {
    await AuthRepo.deleteAllSessionsByUserId(userId);
    return { message: "Logged out from all devices successfully." };
  }
}
