import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Mixed } from "mongoose";
import { v4 as uuidv4 } from "uuid";

@Schema({ timestamps: true })
export class DraftOffer extends Document {
  @Prop({ type: String, default: uuidv4 })
  _id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, type: [Object] })
  body: Mixed[];
}

export const DraftOfferSchema = SchemaFactory.createForClass(DraftOffer);
