export class AppError extends Error {
  status: number;
  code?: string;
  constructor(message: string, status = 500, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export class BadRequestError extends AppError {
  constructor(msg = 'Bad Request') {
    super(msg, 400);
  }
}
export class UnauthorizedError extends AppError {
  constructor(msg = 'Unauthorized') {
    super(msg, 401);
  }
}
export class ForbiddenError extends AppError {
  constructor(msg = 'Forbidden') {
    super(msg, 403);
  }
}
export class NotFoundError extends AppError {
  constructor(msg = 'Not Found') {
    super(msg, 404);
  }
}
export class ConflictError extends AppError {
  constructor(msg = 'Conflict') {
    super(msg, 409);
  }
}
