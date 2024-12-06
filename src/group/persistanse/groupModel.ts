import mongoose from "mongoose";

const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
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

const GroupModel = mongoose.model("Group", groupSchema);

export default GroupModel;
