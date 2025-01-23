import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const payerSubSchema = new mongoose.Schema({
  _id: {
    type: String,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
});

const detailsSubSchema = new mongoose.Schema({
  card_type: {
    type: String,
    required: true,
  },
  card_last4: {
    type: String,
    required: true,
  },
  exp_month: {
    type: String,
    required: true,
  },
  exp_year: {
    type: String,
    required: true,
  },
});

const paymentsSubSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: uuidv4,
  },
  transaction_id: {
    type: String,
  },
  status: {
    type: String,
    enum: ["success", "pending", "failed"],
    required: true,
  },
  payment_method: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Number,
    required: true,
  },
  sum: {
    type: Number,
    required: true,
  },
  payer: {
    type: payerSubSchema,
    required: true,
  },
  details: {
    type: detailsSubSchema,
    required: true,
  },
  description: {
    type: String,
    required: false,
  },
});

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
  payments: {
    type: [paymentsSubSchema],
    required: false,
  },
});

const SubscriptionModel = mongoose.model("Subscription", subscriptionSchema);

export default SubscriptionModel;
