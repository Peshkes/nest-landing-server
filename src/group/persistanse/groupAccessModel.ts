import mongoose from "mongoose";
import { Roles } from "../../authentication/authentication.types";

const groupAccessSubSchema = new mongoose.Schema(
  {
    account_id: {
      type: String,
      required: true,
      unique: true,
      ref: "User",
    },
    role: {
      type: Number,
      enum: Roles,
      required: true,
    },
  },
  { _id: false },
);

const groupAccessSchema = new mongoose.Schema(
  {
    groups: {
      type: Map,
      of: [groupAccessSubSchema],
      required: false,
    },
  },
  { _id: false },
);

const GroupAccessModel = mongoose.model("GroupAccess", groupAccessSchema);

export default GroupAccessModel;
