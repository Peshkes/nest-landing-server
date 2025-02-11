import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { DraftOffer } from "../offer.types";

const draftOfferSchema = new mongoose.Schema<DraftOffer>(
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

export default draftOfferSchema;
