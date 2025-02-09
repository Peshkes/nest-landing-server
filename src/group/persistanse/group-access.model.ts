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
    type: String,
    enum: Object.keys(Roles),
    required: true,
  },
});

groupAccessSchema.index({ group_id: 1, user_id: 1 }, { unique: true });
groupAccessSchema.index({ user_id: 1, role: 1 });
groupAccessSchema.index({ group_id: 1 });

const GroupAccessModel = mongoose.model("GroupAccess", groupAccessSchema);

export default GroupAccessModel;
