import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { PublicOfferDocument } from "../../offer/persistance/public-offer.schema";
import { DraftOfferDocument } from "../../offer/persistance/draft-offer.schema";
import { Group } from "../group.types";

@Schema({ timestamps: true })
export class GroupDocument extends Document implements Group {
  @Prop({ type: String, default: uuidv4 })
  _id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ type: Object, required: true, default: {} })
  settings: Record<string, unknown>;
}

export const GroupSchema = SchemaFactory.createForClass(GroupDocument);
