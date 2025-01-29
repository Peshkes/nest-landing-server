import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { PaymentStatus } from "../dto/payment-status.enum";
import { PaymentSystems } from "../dto/payment-systems.enum";

// const payerSubSchema = new mongoose.Schema({
//   _id: {
//     type: String,
//   },
//   name: {
//     type: String,
//     required: true,
//   },
//   email: {
//     type: String,
//     required: true,
//   },
//   phone: {
//     type: String,
//     required: true,
//   },
// });
//
// const detailsSubSchema = new mongoose.Schema({
//   card_type: {
//     type: String,
//     required: true,
//   },
//   card_last4: {
//     type: String,
//     required: true,
//   },
//   exp_month: {
//     type: String,
//     required: true,
//   },
//   exp_year: {
//     type: String,
//     required: true,
//   },
// });

const paymentsSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: uuidv4,
    },
    sum: {
      type: Number,
      required: false,
    },
    status: {
      type: String,
      enum: PaymentStatus,
      required: true,
    },
    payment_system: {
      type: PaymentSystems,
      enum: ["stripe", "yoo_money"],
      required: true,
    },
    description: {
      type: String,
      required: false,
    },
    payment_details: {
      type: Object,
      required: false,
      default: {},
    },
  },
  {
    timestamps: true,
    _id: true,
  },
);

const PaymentModel = mongoose.model("Payment", paymentsSchema);

export default PaymentModel;
