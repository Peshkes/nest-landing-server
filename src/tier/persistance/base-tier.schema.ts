import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Mixed } from "mongoose";
import { BaseTier } from "../tier.types";

@Schema()
export class BaseTierDocument extends Document implements BaseTier {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: Object, required: true })
  settings: Mixed;
}

export const BaseTierSchema = SchemaFactory.createForClass(BaseTierDocument);
