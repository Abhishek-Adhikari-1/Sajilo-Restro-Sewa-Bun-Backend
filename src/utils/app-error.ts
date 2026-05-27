import type { HttpStatusCode } from "./http-status";

export class AppError extends Error {
  public statusCode: HttpStatusCode;
  public isOperational: boolean;
  public errors?: unknown;
  public code: string;

  constructor(statusCode: HttpStatusCode, message: string, errors?: unknown) {
    super(message);
    this.code = "AppError";
    this.statusCode = statusCode;
    this.isOperational = true;
    this.name = this.constructor.name;
    this.errors = errors;

    Error.captureStackTrace(this, this.constructor);
  }
}
