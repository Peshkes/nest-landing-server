import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Mixed } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { Payment, PaymentStatus } from "../subscription.types";

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

@Schema({ timestamps: true })
export class PaymentDocument extends Document implements Payment {
  @Prop({ type: String, default: uuidv4 })
  _id: string;

  @Prop({ type: Number, required: true })
  sum: number;

  @Prop({ type: String, enum: Object.values(PaymentStatus), required: true })
  status: PaymentStatus;

  @Prop({ type: String, enum: Object.values(PaymentStatus), required: true })
  payment_system: PaymentStatus;

  @Prop({ type: String, required: false })
  description?: string;

  @Prop({ type: Object, default: {} })
  payment_details?: Mixed;
}

export const PaymentSchema = SchemaFactory.createForClass(PaymentDocument);
