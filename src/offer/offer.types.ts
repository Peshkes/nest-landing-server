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

export enum OwnerType {
  group = "group",
  user = "user",
}

export enum SortType {
  min = "-updatedAt",
  pls = "+updatedAt",
}

export interface AbstractOffer {
  _id: string;
  name: string;
  body: object;
  status: OfferStatus;
  owner_type: OwnerType;
  owner_id: string;
}

export type DraftOffer = AbstractOffer & DraftOfferExtraFields;

export type DraftOfferExtraFields = {
  // status: OfferStatus.draft;
  published_id?: string;
};

export type PublicOfferExtraFields = {
  publication_date: Date;
  expiration_date: Date;
  views: number;
  draft_id?: string;
};

export type PublicOffer = AbstractOffer & PublicOfferExtraFields;

export type Offer = DraftOffer | PublicOffer;

export type OfferRole = RoleName | "owner";
