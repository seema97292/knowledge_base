import jwt from "jsonwebtoken";
import { Response, NextFunction } from "express";
import User from "../models/User";
import { AuthRequest, JWTPayload } from "../types";

const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  let token: string | undefined;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;

      const userDoc = await User.findById(decoded.id).select("-password");

      if (userDoc) {
        req.user = {
          _id: (userDoc._id as any).toString(),
          username: userDoc.username,
          email: userDoc.email,
        };
      }

      next();
    } catch (error) {
      console.error("Token verification failed:", error);
      res.status(401).json({ message: "Not authorized, token failed" });
      return;
    }
  }

  if (!token) {
    res.status(401).json({ message: "Not authorized, no token" });
    return;
  }
};

const protectWithoutAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  let token: string | undefined;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;

      const userDoc = await User.findById(decoded.id).select("-password");

      if (userDoc) {
        req.user = {
          _id: (userDoc._id as any).toString(),
          username: userDoc.username,
          email: userDoc.email,
        };
      }

      next();
    } catch (error) {
      console.error("Token verification failed:", error);
      res.status(401).json({ message: "Not authorized, token failed" });
      return;
    }
  }

  if (!token) {
    return;
  }
};

export { protect, protectWithoutAuth };
