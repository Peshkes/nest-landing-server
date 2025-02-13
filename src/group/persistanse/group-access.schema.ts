import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { GroupAccess, Roles } from "../group.types";
import { GroupDocument } from "./group.schema";
import { UserDocument } from "../../authentication/persistence/user.schema";
import { Document } from "mongoose";

@Schema({ timestamps: true })
export class GroupAccessDocument extends Document implements GroupAccess{
  @Prop({ required: true, ref: GroupDocument.name })
  group_id: string;

  @Prop({ required: true, ref: UserDocument.name })
  user_id: string;

  @Prop({ required: true, enum: Object.keys(Roles) })
  role: string;
}

export const GroupAccessSchema = SchemaFactory.createForClass(GroupAccessDocument);

GroupAccessSchema.index({ group_id: 1, user_id: 1 }, { unique: true });
GroupAccessSchema.index({ user_id: 1, role: 1 });
GroupAccessSchema.index({ group_id: 1 });
