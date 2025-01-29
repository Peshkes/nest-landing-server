import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const subscriptionSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: uuidv4,
  },
  tier_id: {
    type: String,
    required: true,
    ref: "SalesTier",
  },
  key: {
    type: String,
    required: true,
  },
  start_date: {
    type: Date,
    required: true,
  },
  expiration_date: {
    type: Date,
    required: true,
  },
  is_active: {
    type: Boolean,
    required: true,
  },
  payments_ids: {
    type: [String],
    required: false,
    default: [],
  },
  description: {
    type: String,
    required: false,
  },
});

const SubscriptionModel = mongoose.model("Subscription", subscriptionSchema);

export default SubscriptionModel;
