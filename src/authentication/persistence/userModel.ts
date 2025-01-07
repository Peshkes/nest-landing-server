import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  superUser: {
    type: Boolean,
    required: false,
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
  lastPasswords: {
    type: [String],
    required: true,
  },
  subscription: {
    type: String,
    required: false,
    ref: "Subscription",
  },
  public_offers: {
    type: [String],
    required: true,
    ref: "PublicOffer",
  },
  draft_offers: {
    type: [String],
    required: true,
    ref: "DraftOffer",
  },
});

const UserModel = mongoose.model("User", userSchema);

export default UserModel;
