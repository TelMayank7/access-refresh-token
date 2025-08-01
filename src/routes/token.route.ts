import express from "express";
import { refreshToken } from "../controllers/token.controller";

const tokenRouter = express.Router();

tokenRouter.post("/refresh-token", refreshToken);

export default tokenRouter;
