import mongoose from "mongoose";
import { Roles } from "../group.types";

const groupAccessSchema = new mongoose.Schema({
  group_id: {
    type: String,
    required: true,
    ref: "Group",
  },
  user_id: {
    type: String,
    required: true,
    ref: "User",
  },
  role: {
    type: Number,
    enum: Roles,
    required: true,
  },
});

groupAccessSchema.index({ group_id: 1, user_id: 1 }, { unique: true });

const GroupAccessModel = mongoose.model("GroupAccess", groupAccessSchema);

export default GroupAccessModel;
