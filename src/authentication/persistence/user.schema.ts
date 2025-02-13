import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { SubscriptionDocument } from "../../subscription/persistanse/subscription.schema";
import { PublicOfferDocument } from "../../offer/persistance/public-offer.schema";
import { DraftOfferDocument } from "../../offer/persistance/draft-offer.schema";
import { User } from "../authentication.types";

@Schema({ timestamps: { createdAt: true, updatedAt: true } })
export class UserDocument extends Document implements User{
  @Prop({ default: uuidv4 })
  _id: string;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true, unique: true, trim: true })
  phone: string;

  @Prop({ required: true, default: false })
  email_verified: boolean;

  @Prop({ required: true })
  password: string;

  @Prop({ type: [String], required: true, default: [] })
  last_passwords: string[];

  @Prop({ type: [String], default: [], ref: SubscriptionDocument.name })
  subscriptions: string[];

  @Prop({ type: [String], required: true, default: [], ref: PublicOfferDocument.name })
  public_offers: string[];

  @Prop({ type: [String], required: true, default: [], ref: DraftOfferDocument.name })
  draft_offers: string[];

  @Prop({ required: false, default: false })
  deleted?: boolean;

  @Prop({ type: Date, required: false })
  deletion_date?: Date;
}

export const UserSchema = SchemaFactory.createForClass(UserDocument);
