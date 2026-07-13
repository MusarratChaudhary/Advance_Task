import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

import { env } from "../config/env.js";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
      };
    }
  }
}

export const protect = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized. Please login.",
      });
    }

    const decoded = jwt.verify(token, env.JWT_SECRET) as {
      id: string;
    };

    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};
