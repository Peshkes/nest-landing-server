import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { BaseTier } from "./base-tier.schema";

@Schema()
export class SalesTier extends Document {
  @Prop({ type: String, default: uuidv4 })
  _id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  duration: number;

  @Prop({ required: true })
  price: number;

  @Prop({ type: String, ref: BaseTier.name, required: true })
  base_tier: string;

  @Prop()
  sales_price?: number;

  @Prop()
  expiration_date?: Date;
}

export const SalesTierSchema = SchemaFactory.createForClass(SalesTier);