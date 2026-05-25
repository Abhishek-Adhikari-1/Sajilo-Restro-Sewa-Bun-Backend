import Elysia from "elysia";

export const responseWrapper = new Elysia({
  name: "sajilo-restro-sewa-response-wrapper",
}).onAfterHandle(
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
);
