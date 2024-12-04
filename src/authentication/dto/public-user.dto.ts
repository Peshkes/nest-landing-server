import { ObjectId } from "mongoose";

export class PublicUserDto {
  id: ObjectId;
  name: string;
  email: string;
}
