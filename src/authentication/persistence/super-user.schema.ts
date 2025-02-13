import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { v4 as uuidv4 } from "uuid";

@Schema({ timestamps: true })
export class SuperUser extends Document {
  @Prop({ default: uuidv4 })
  _id: string;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ type: [String], required: true })
  last_passwords: string[];
}

export const SuperUserSchema = SchemaFactory.createForClass(SuperUser);