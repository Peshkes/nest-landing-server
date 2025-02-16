import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { BaseTierDocument } from "./base-tier.schema";
import { SalesTier } from "../../share/share.types";

@Schema()
export class SalesTierDocument extends Document implements SalesTier {
  @Prop({ type: String, default: uuidv4 })
  _id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  duration: number;

  @Prop({ required: true })
  price: number;

  @Prop({ type: String, ref: BaseTierDocument.name, required: true })
  base_tier: string;

  @Prop()
  sales_price?: number;

  @Prop()
  expiration_date?: Date;
}

export const SalesTierSchema = SchemaFactory.createForClass(SalesTierDocument);
