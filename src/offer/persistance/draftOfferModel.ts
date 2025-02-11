import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const draftOfferSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: uuidv4,
    },
    name: {
      type: String,
      required: true,
    },
    body: {
      type: [mongoose.Schema.Types.Mixed],
      required: true,
    },
  },
  { timestamps: true },
);

const DraftOfferModel = mongoose.model("DraftOffer", draftOfferSchema);

export default DraftOfferModel;
