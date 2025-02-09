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
