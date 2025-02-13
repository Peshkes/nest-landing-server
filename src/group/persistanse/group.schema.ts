import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { PublicOffer } from "../../offer/persistance/public-offer.schema";
import { DraftOffer } from "../../offer/persistance/draft-offer.schema";

@Schema({ timestamps: true })
export class Group extends Document {
  @Prop({ type: String, default: uuidv4 })
  _id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ type: [String], ref: PublicOffer.name, default: [] })
  public_offers: string[];

  @Prop({ type: [String], ref: DraftOffer.name, default: [] })
  draft_offers: string[];

  @Prop({ type: Object, required: true, default: {} })
  settings: Record<string, unknown>;
}

export const GroupSchema = SchemaFactory.createForClass(Group);
