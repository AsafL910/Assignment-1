import mongoose, { Schema, Document, Model, CallbackError } from "mongoose";
import bcrypt from "bcrypt";

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  tokens: string[];
}

const userSchema: Schema<IUser> = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  tokens: { type: [String], default: [] },
});

const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);

export default User;
