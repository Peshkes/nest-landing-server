import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { AbstractOffer, DraftOffer, OfferStatus, OwnerType, PublicOffer } from "../offer.types";
import { v4 as uuidv4 } from "uuid";

/**
 * Базовый класс OfferDocument
 */
@Schema({ timestamps: true, discriminatorKey: "status" })
export class OfferDocument extends Document implements AbstractOffer {
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

export const OfferSchema = SchemaFactory.createForClass(OfferDocument);

@Schema()
export class DraftOfferDocument extends OfferDocument implements DraftOffer {
  @Prop({ required: true, enum: OfferStatus })
  status: OfferStatus.draft;

  @Prop({ type: String, required: false })
  published_id?: string;
}

export const DraftOfferSchema = SchemaFactory.createForClass(DraftOfferDocument);

@Schema()
export class PublicOfferDocument extends OfferDocument implements PublicOffer {
  @Prop({ required: true, enum: OfferStatus })
  status: OfferStatus.published;

  @Prop({ type: Date, required: true })
  publication_date: Date;

  @Prop({ type: Date, required: true })
  expiration_date: Date;

  @Prop({ type: Number, default: 0 })
  views: number;

  @Prop({ type: String, required: false })
  draft_id?: string;
}

export const PublicOfferSchema = SchemaFactory.createForClass(PublicOfferDocument);
