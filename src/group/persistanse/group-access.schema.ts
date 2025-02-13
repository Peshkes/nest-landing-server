import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Roles } from "../group.types";
import { Group } from "./group.schema";
import { User } from "../../authentication/persistence/user.schema";

@Schema({ timestamps: true })
export class GroupAccess extends Document {
  @Prop({ required: true, ref: Group.name })
  group_id: string;

  @Prop({ required: true, ref: User.name })
  user_id: string;

  @Prop({ required: true, enum: Object.keys(Roles) })
  role: string;
}

export const GroupAccessSchema = SchemaFactory.createForClass(GroupAccess);

GroupAccessSchema.index({ group_id: 1, user_id: 1 }, { unique: true });
GroupAccessSchema.index({ user_id: 1, role: 1 });
GroupAccessSchema.index({ group_id: 1 });