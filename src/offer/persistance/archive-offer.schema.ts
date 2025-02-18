import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { AbstractOffer, OfferStatus, OwnerType } from "../offer.types";
import { v4 as uuidv4 } from "uuid";

@Schema({ timestamps: { createdAt: true } })
export class ArchiveOfferDocument extends Document implements AbstractOffer {
  @Prop({ type: String, default: uuidv4 })
  _id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ type: Object, required: true })
  body: Record<string, any>;

  @Prop({ required: true, enum: OfferStatus })
  status: OfferStatus;

  @Prop({ required: true, enum: OwnerType })
  owner_type: OwnerType;

  @Prop({ required: true, type: String })
  owner_id: string;
}

export const ArchiveOfferSchema = SchemaFactory.createForClass(ArchiveOfferDocument);
