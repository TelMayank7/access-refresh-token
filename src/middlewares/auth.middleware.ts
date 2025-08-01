import { Request, Response, NextFunction } from "express";
import userModel from "../models/user.model";
import jwt from "jsonwebtoken";
export interface AuthenticatedRequest extends Request {
  user?: any;
}
export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    // verify the token
    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET as string
    );
    if (!decoded) {
      return res.status(403).json({ message: "Invalid token" });
    }

    // Check if the token version matches
    const tokenVersion = (decoded as any).tokenVersion;
    const userId = (decoded as any).userId;
    
    const user = await userModel.findOne({
      _id: userId,
      tokenVersion,
    });
    if (!user) {
      return res.status(403).json({ message: "Invalid token version" });
    }

    // Attach user information to the request object
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
