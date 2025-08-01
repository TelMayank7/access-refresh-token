import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import Token from "../models/token.model";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateTokens";
import userModel from "../models/user.model";

export const refreshToken = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: "No refresh token provided" });
    }

    // Verify the refresh token
    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET as string
    );

    if (!decoded) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }
    const userId = (decoded as any).userId;

    // Find the user associated with the refresh token
    const tokenRecord = await Token.findOne({
      userId,
      token: refreshToken,
    });

    if (!tokenRecord) {
      return res.status(403).json({ message: "Refresh token not found" });
    }

    // Check if the user exists and for the token version
    const user = await userModel.findOne({
      _id: userId,
    });
    if (!user) {
      return res.status(403).json({ message: "User not found" });
    }

    // Generate new access token
    const accessToken = generateAccessToken(
      (decoded as any).userId,
      user.tokenVersion
    );
    const newRefreshToken = generateRefreshToken((decoded as any).userId);

    // Update the refresh token in the database
    tokenRecord.token = newRefreshToken;

    await tokenRecord.save();

    // Set the new refresh token in the cookie
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
      message: "Tokens refreshed successfully",
      accessToken,
    });
  } catch (error) {
    console.error("Error refreshing token:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
