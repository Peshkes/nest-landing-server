import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Mixed } from "mongoose";
import { v4 as uuidv4 } from "uuid";

@Schema({ timestamps: true })
export class PublicOffer extends Document {
  @Prop({ type: String, default: uuidv4 })
  _id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, type: [Object] })
  body: Mixed[];

  @Prop({ required: true, default: 0 })
  views: number;

  @Prop({ required: true })
  expiration_date: Date;
}

export const PublicOfferSchema = SchemaFactory.createForClass(PublicOffer);