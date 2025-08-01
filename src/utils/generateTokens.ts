import jwt from "jsonwebtoken";
export const generateAccessToken = (userId: string , tokenVersion: number): string => {
  return jwt.sign({ userId , tokenVersion }, process.env.ACCESS_TOKEN_SECRET as string, {
    expiresIn: "15m",
  });
};

export const generateRefreshToken = (userId: string): string => {
  return jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET as string, {
    expiresIn: "7d",
  });
};
