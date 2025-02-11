import { v4 as uuidv4 } from "uuid";
import mongoose from "mongoose";

export type OfferPreview = {
  _id: string;
  image: string;
  name: string;
  status: OfferStatus;
  views: number;
  expirationDate?: Date;
};

export enum OfferStatus {
  draft = "draft",
  published = "published",
  archived = "archived",
}

export interface DraftOffer {
  _id: string;
  name: string;
  body: Object;
}

export interface PublicOffer extends DraftOffer {
  expiration_date: Date;
  views: number;
}