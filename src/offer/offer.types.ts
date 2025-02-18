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

export interface DraftOffer extends AbstractOffer {
  status: OfferStatus.draft;
  published_id?: string;
}

export interface PublicOffer extends AbstractOffer {
  status: OfferStatus.published;
  publication_date: Date;
  expiration_date: Date;
  views: number;
  draft_id?: string;
}

export type Offer = DraftOffer | PublicOffer;

export interface DraftOffer1 {
  _id: string;
  name: string;
  body: object;
}

export interface PublicOffer1 extends DraftOffer1 {
  expiration_date: Date;
  views: number;
}

export type OfferRole = RoleName | "owner";
