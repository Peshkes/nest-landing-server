import mongoose from "mongoose";

const paymentsSubSchema = new mongoose.Schema({
  tier_id: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    required: true,
  },
  sum: {
    type: Number,
    required: true,
  },
});

const subscriptionSchema = new mongoose.Schema({
  tier_id: {
    type: String,
    required: true,
    ref: "SalesTier",
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
    required: true,
  },
});

const SubscriptionModel = mongoose.model("Subscription", subscriptionSchema);

export default SubscriptionModel;
