import { model, Schema, Types } from "mongoose";

const tokenSchema = new Schema({
  userId: { type: Types.ObjectId, ref: "User" },
  token: { type: String },
});

export default model("Token", tokenSchema);
