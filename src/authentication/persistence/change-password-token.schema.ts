import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { User } from "./user.schema";

@Schema({
  timestamps: { createdAt: true, updatedAt: false },
})
export class ChangePasswordToken extends Document {
  @Prop({ required: true, ref: User.name })
  _id: string;

  @Prop({ required: true })
  token: string;

  @Prop({ default: Date.now, expires: 3600 })
  createdAt: Date;
}

export const ChangePasswordTokenSchema = SchemaFactory.createForClass(ChangePasswordToken);