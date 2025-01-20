import mongoose from "mongoose";

const changePasswordTokenSchema = new mongoose.Schema({
  userId: {
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

const ChangePasswordTokenModel = mongoose.model("ChangePasswordToken", changePasswordTokenSchema);
export default ChangePasswordTokenModel;
