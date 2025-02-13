import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Mixed } from "mongoose";

@Schema()
export class BaseTier extends Document {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: Object, required: true })
  settings: Mixed;
}

export const BaseTierSchema = SchemaFactory.createForClass(BaseTier);
