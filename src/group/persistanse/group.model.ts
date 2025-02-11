import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { Group } from "../group.types";

const groupSchema = new mongoose.Schema<Group>({
  _id: {
    type: String,
    default: uuidv4,
    unique: true,
  },
  name: {
    type: String,
    required: true,
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
  settings: {
    type: Object,
    required: true,
    default: {},
  },
});

const GroupModel = mongoose.model("Group", groupSchema);

export default GroupModel;
