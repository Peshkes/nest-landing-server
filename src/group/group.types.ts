import { ObjectId } from "mongoose";

export type GroupAccess = {
  accountId: ObjectId;
  role: string;
};

export type Group = {
  _id?: ObjectId;
  name: string;
  members: string[];
  publicOffers: string[];
  draftOffers: string[];
};
