import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

import * as dotenv from "dotenv";
dotenv.config();

// Types
interface AuthenticatedRequest extends Request {
    user?: string | jwt.JwtPayload;
}

export const authenticateUser = (req:AuthenticatedRequest, res:Response, next:NextFunction):void => {
  let token = req.headers.authorization?.split(" ")[1];

  if (!token && req.cookies) {
    token = req.cookies["token"];
  }
  token = req.cookies["token"];
console.log(token);
  if (!token) return next({ status: 401, message: "Unauthorized: No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = decoded;
    next();
  } catch (error) {
    return next({ status: 403, message: "Forbidden: Invalid token" });
  }
};
