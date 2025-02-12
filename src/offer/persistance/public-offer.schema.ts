import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { PublicOffer } from "../offer.types";

const publicOfferSchema = new mongoose.Schema<PublicOffer>(
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
    views: {
      type: Number,
      required: true,
      default: 0,
    },
    expiration_date: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true },
);

export default publicOfferSchema;
