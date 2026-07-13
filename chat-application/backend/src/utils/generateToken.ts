import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import type { StringValue } from "ms";

interface TokenPayload {
  id: string;
}

export const generateToken = (id: string) => {
  return jwt.sign(
    {
      id,
    } as TokenPayload,
    env.JWT_SECRET,
    {
      expiresIn: env.JWT_EXPIRE as StringValue,
    },
  );
};
