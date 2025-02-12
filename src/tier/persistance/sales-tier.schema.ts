import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const salesTierSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: uuidv4,
  },
  name: {
    type: String,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  base_tier: {
    type: String,
    required: true,
    ref: "BaseTier",
  },
  sales_price: {
    type: Number,
    required: false,
  },
  expiration_date: {
    type: Date,
    required: false,
  },
});

export default salesTierSchema;
