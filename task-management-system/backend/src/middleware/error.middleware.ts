import { Request, Response, NextFunction } from "express";

interface ErrorHandler extends Error {
  statusCode?: number;
}

export const notFound = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,

    message: `Route not found: ${req.originalUrl}`,
  });
};

export const errorHandler = (
  error: ErrorHandler,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  console.error("Global Error:", error);

  const statusCode = error.statusCode || 500;

  res.status(statusCode).json({
    success: false,

    message: error.message || "Internal Server Error",
  });
};
