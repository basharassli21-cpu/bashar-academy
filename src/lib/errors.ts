import { recordErrorLog } from "@/lib/error-log";

export class AppError extends Error {
  constructor(message: string, public status: number) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Authentication required") {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "You do not have permission to do this") {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Not found") {
    super(message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message = "This action conflicts with the current state") {
    super(message, 409);
  }
}

export class ValidationError extends AppError {
  constructor(message = "Invalid input") {
    super(message, 422);
  }
}

export class TooManyRequestsError extends AppError {
  constructor(message = "Too many attempts. Please try again later.") {
    super(message, 429);
  }
}

export function errorResponseBody(error: unknown): { message: string; status: number } {
  if (error instanceof AppError) {
    return { message: error.message, status: error.status };
  }
  console.error(error);
  recordErrorLog(error);
  return { message: "Something went wrong", status: 500 };
}
