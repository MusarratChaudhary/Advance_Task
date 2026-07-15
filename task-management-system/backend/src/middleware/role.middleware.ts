import { Request, Response, NextFunction } from "express";
import User, { UserRole } from "../models/User";

export const authorize = (...roles: UserRole[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      if (!roles.includes(user.role)) {
        return res.status(403).json({
          success: false,

          message: "You do not have permission to perform this action",
        });
      }

      next();
    } catch (error) {
      console.error("Role Middleware Error:", error);

      return res.status(500).json({
        success: false,

        message: "Server error",
      });
    }
  };
};
