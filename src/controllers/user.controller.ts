import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateTokens";
import User from "../models/user.model";
import Token from "../models/token.model";
import bcrypt from "bcrypt";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

export const createUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = new User({ email, password });
    await user.save();

    const accessToken = generateAccessToken(
      user._id.toString(),
      user.tokenVersion
    );
    const refreshToken = generateRefreshToken(user._id.toString());

    await Token.create({
      userId: user._id,
      token: refreshToken,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "strict",
      secure: false, // true in production with HTTPS
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({ message: "User created successfully", accessToken });
  } catch (error) {
    console.error("Error creating user:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // Update token version
    user.tokenVersion += 1;
    await user.save();

    const accessToken = generateAccessToken(
      user._id.toString(),
      user.tokenVersion
    );
    const refreshToken = generateRefreshToken(user._id.toString());

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "strict",
      secure: false, // true in production with HTTPS
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    await Token.create({
      userId: user._id,
      token: accessToken,
    });

    res.status(200).json({ message: "Login successful", accessToken });
  } catch (error) {
    console.log("Error logging in:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const logout = async (req: AuthenticatedRequest, res: Response) => {
  const token = req.cookies.refreshToken;
  if (token) {
    try {
      const payload: any = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET!);
      await Token.deleteOne({ userId: payload.userId });
    } catch {}
  }

  // Increment token version
  const user = await User.findOne({ _id: req.user?.userId });
  if (user) {
    user.tokenVersion += 1;
    await user.save();
  }

  res.clearCookie("refreshToken", {
    httpOnly: true,
    sameSite: "strict",
    secure: false,
  });
  res.json({ message: "Logged out" });
};

export const getUserProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
