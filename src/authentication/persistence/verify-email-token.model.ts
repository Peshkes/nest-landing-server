import mongoose from "mongoose";

const verifyEmailTokenSchema = new mongoose.Schema({
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

const VerifyEmailTokenModel = mongoose.model("VerifyEmailToken", verifyEmailTokenSchema);
export default VerifyEmailTokenModel;
