import type { NextFunction, Request, Response } from "express";

export class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function errorHandler(
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  const status = error instanceof HttpError ? error.status : 500;
  const message =
    status === 500 ? "Something went wrong. Please try again." : error.message;

  if (status === 500) {
    console.error(error);
  }

  res.status(status).json({ message });
}
