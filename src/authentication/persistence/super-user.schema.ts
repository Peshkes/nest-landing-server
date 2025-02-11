import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const superUserSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: uuidv4,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    last_passwords: {
      type: [String],
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export default superUserSchema;
