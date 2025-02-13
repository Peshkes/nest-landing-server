import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { SalesTier } from "../../tier/persistance/sales-tier.schema";

@Schema({ timestamps: true })
export class Subscription extends Document {
  @Prop({ type: String, default: uuidv4 })
  _id: string;

  @Prop({ type: String, required: true, ref: SalesTier.name })
  tier_id: string;

  @Prop({ type: String, required: true })
  key: string;

  @Prop({ type: Date, required: true })
  start_date: Date;

  @Prop({ type: Date, required: true })
  expiration_date: Date;

  @Prop({ type: Boolean, required: true })
  is_active: boolean;

  @Prop({ type: [String], default: [] })
  payments_ids?: string[];

  @Prop({ type: String, required: false })
  description?: string;
}

export const SubscriptionSchema = SchemaFactory.createForClass(Subscription);