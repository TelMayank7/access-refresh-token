import express from "express";
import dotenv from "dotenv";
import connectDB from "./configs/connectDB";
import cookieParser from "cookie-parser";
import userRouter from "./routes/user.route";
import tokenRouter from "./routes/token.route";

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const PORT = process.env.PORT || 3030;

// Routes
app.use("/api/users", userRouter);
app.use("/api/tokens", tokenRouter);


app.listen(PORT, () => {
  connectDB();
  console.log(`Server is running on http://localhost:${PORT}`);
});
