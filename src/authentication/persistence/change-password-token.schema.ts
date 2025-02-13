import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { UserDocument } from "./user.schema";
import { TokenData } from "../authentication.types";

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class ChangePasswordTokenDocument extends Document implements TokenData{
  @Prop({ required: true, ref: UserDocument.name })
  _id: string;

  @Prop({ required: true })
  token: string;

  @Prop({ default: Date.now, expires: 3600 })
  createdAt: Date;
}

export const ChangePasswordTokenSchema = SchemaFactory.createForClass(ChangePasswordTokenDocument);
