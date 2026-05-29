import { env } from "../../config/env";
import type { UserRole } from "../../types/auth";
import { AppError } from "../../utils/app-error";
import { HTTP_STATUS } from "../../utils/http-status";
import { sendEmail } from "../../utils/send-email";
import { createUserDocument } from "../user/user.model";
import type { AuthModel } from "./auth.model";
import admin from "firebase-admin";

export abstract class Auth {
  static async signIn({ email, password }: AuthModel["signInBody"]) {
    const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${env.FIREBASE_AUTH_API_KEY}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        returnSecureToken: true,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      // The exact string literals returned by the Firebase REST API during login
      type FirebaseAuthError =
        | "INVALID_LOGIN_CREDENTIALS"
        | "USER_DISABLED"
        | "INVALID_EMAIL"
        | "TOO_MANY_ATTEMPTS_TRY_LATER";

      const errorData = data as {
        error: {
          code: number;
          message: FirebaseAuthError;
          errors: object[];
        };
      };

      switch (errorData.error.message) {
        case "INVALID_LOGIN_CREDENTIALS":
          throw new AppError(
            HTTP_STATUS.UNAUTHORIZED,
            "Invalid email or password.",
          );

        case "USER_DISABLED":
          throw new AppError(
            HTTP_STATUS.FORBIDDEN,
            "This account has been disabled by an administrator.",
          );

        case "TOO_MANY_ATTEMPTS_TRY_LATER":
          throw new AppError(
            HTTP_STATUS.TOO_MANY_REQUESTS,
            "Too many failed attempts. Please try again later.",
          );

        case "INVALID_EMAIL":
          throw new AppError(
            HTTP_STATUS.BAD_REQUEST,
            "The email address is badly formatted.",
          );

        default:
          throw new AppError(
            HTTP_STATUS.INTERNAL_SERVER_ERROR,
            "An internal authentication error occurred.",
          );
      }
    }

    const successData = data as {
      kind: string;
      localId: string;
      email: string;
      displayName: string;
      idToken: string;
      registered: boolean;
      refreshToken: string;
      expiresIn: string;
    };

    return {
      token: successData.idToken,
      refreshToken: successData.refreshToken,
      expiresIn: successData.expiresIn,
      uid: successData.localId,
    };
  }

  static async signUp({
    email,
    password,
    name,
    role = "waiter",
  }: AuthModel["signUpBody"]) {
    const auth = admin.auth();

    try {
      const user = await auth.createUser({
        email,
        password,
        displayName: name,
      });


      await createUserDocument({
        uid: user.uid,
        name,
        email,
        role,
      });

      const verificationLink = new URL(
        await admin.auth().generateEmailVerificationLink(email),
      );

      sendEmail({
        code: verificationLink.searchParams.get("oobCode"),
        language: verificationLink.searchParams.get("lang"),
      });

      const userObj: {
        uid: string;
        email: string;
        displayName: string;
        emailVerified: boolean;
        disabled: boolean;
        tokenValidAfterTime: string;
        metadata: {
          lastSignInTime: string | null;
          creationTime: string;
          lastRefreshTime: string | null;
        };
      } = user as any;

      return {
        uid: userObj.uid,
        email: userObj.email,
        name: userObj.displayName,
        role,
        emailVerified: userObj.emailVerified,
        disabled: userObj.disabled,
        tokenValidAfterTime: userObj.tokenValidAfterTime,
        metadata: {
          lastSignInTime: userObj.metadata.lastSignInTime,
          creationTime: userObj.metadata.creationTime,
          lastRefreshTime: userObj.metadata.lastRefreshTime,
        },
      };
    } catch (error: any) {
      switch (error?.code) {
        case "auth/email-already-exists":
          throw new AppError(
            HTTP_STATUS.CONFLICT,
            "The email address is already in use by another account.",
          );

        case "auth/invalid-email":
          throw new AppError(
            HTTP_STATUS.BAD_REQUEST,
            "The email address is badly formatted.",
          );

        case "auth/invalid-password":
        case "auth/weak-password":
          throw new AppError(
            HTTP_STATUS.BAD_REQUEST,
            error.message || "The password must be at least 6 characters long.",
          );

        case "auth/too-many-requests":
          throw new AppError(
            HTTP_STATUS.TOO_MANY_REQUESTS,
            "Too many failed attempts. Please try again later.",
          );

        default:
          throw new AppError(
            HTTP_STATUS.INTERNAL_SERVER_ERROR,
            error.message || "Failed t to create user.",
          );
      }
    }
  }
}
