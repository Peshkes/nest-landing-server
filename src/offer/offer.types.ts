import { RoleName } from "../group/group.types";

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

export type ownerRole = "owner";
export type roleFilter = RoleName | ownerRole;