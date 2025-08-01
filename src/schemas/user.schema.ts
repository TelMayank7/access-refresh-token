import { Document, Model, Types } from "mongoose";

export interface IUser {
  username: string;
  email: string;
  password: string;
  tokenVersion: number;
}

export interface IUserDocument extends IUser, Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IModel extends Model<IUserDocument> {
  comparePassword(candidatePassword: string): Promise<boolean>;
}
