import mongoose from "mongoose";
import { TokenData } from "../authentication.types";

const changePasswordTokenSchema = new mongoose.Schema<TokenData>({
  _id: {
    type: String,
    required: true,
    ref: "user",
  },
  token: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 3600,
  },
});

export default changePasswordTokenSchema;
