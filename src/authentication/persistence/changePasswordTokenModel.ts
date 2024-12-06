import mongoose from "mongoose";
const Schema = mongoose.Schema;

const changePasswordTokenSchema = new mongoose.Schema({
  userId: {
    type: Schema.Types.ObjectId,
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

const ChangePasswordTokenModel = mongoose.model("ChangePasswordTokenSchema", changePasswordTokenSchema);
export default ChangePasswordTokenModel;
