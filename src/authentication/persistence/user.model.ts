import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const userSchema = new mongoose.Schema(
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
    phone: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    emailVerified: {
      type: Boolean,
      required: true,
      default: false,
    },
    password: {
      type: String,
      required: true,
    },
    lastPasswords: {
      type: [String],
      required: true,
      default: [],
    },
    subscription: {
      type: String,
      ref: "Subscription",
    },
    public_offers: {
      type: [String],
      required: true,
      ref: "PublicOffer",
      default: [],
    },
    draft_offers: {
      type: [String],
      required: true,
      ref: "DraftOffer",
      default: [],
    },
    deleted: {
      type: Boolean,
      required: false,
    },
    deletion_date: {
      type: Date,
      required: false,
    },
  },
  {
    timestamps: true,
  },
);

const UserModel = mongoose.model("User", userSchema);
export default UserModel;
