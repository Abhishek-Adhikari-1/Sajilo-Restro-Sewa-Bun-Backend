import Elysia from "elysia";
import { env } from "../config/env";

export const responseWrapper = new Elysia({
  name: "sajilo-restro-sewa-response-wrapper",
})
  .onAfterHandle(
    {
      as: "global",
    },
    ({ responseValue, set }) => {
      const isRaw =
        responseValue instanceof Response ||
        responseValue instanceof Blob ||
        responseValue instanceof ReadableStream ||
        responseValue instanceof Uint8Array;

      if (isRaw) return responseValue;

      const status: number = (set.status as number) ?? 200;

      const success: boolean = status < 400;

      if (typeof responseValue === "object" && responseValue !== null) {
        if ("success" in responseValue) return responseValue;

        return {
          success,
          ...responseValue,
        };
      }

      return {
        success,
        data: responseValue,
      };
    },
  )
  .onError(
    {
      as: "global",
    },
    ({ code, error, set }) => {
      const baseError = {
        success: false,
        code,
      };

      switch (code) {
        case "VALIDATION":
          return {
            ...baseError,
            message: "Validation failed",
            errors: error.all?.map((err: any) => ({
              field: err.path,
              message: err.message,
            })),
          };

        case "NOT_FOUND":
          return {
            ...baseError,
            message: "Resource not found",
          };

        case "PARSE":
          return {
            ...baseError,
            message: "Invalid request body",
          };

        default:
          return {
            ...baseError,
            message:
              env.NODE_ENV !== "production" && error instanceof Error
                ? error.message
                : "Internal server error",
          };
      }
    },
  );
