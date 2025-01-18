import mongoose from "mongoose";
import { Roles } from "../group.types";

const addUserToGroupTokenSchema = new mongoose.Schema({
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

const AddUserToGroupTokenModel = mongoose.model("ChangePasswordToken", addUserToGroupTokenSchema);
export default AddUserToGroupTokenModel;
