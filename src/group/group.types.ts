import { OfferPreview } from "../offer/offer.types";
import { OfferManager } from "../share/interfaces/offer-manager";

export type GroupAccess = {
  group_id: string;
  user_id: string;
  role: RoleName;
};

export interface Group extends OfferManager {
  _id?: string;
  name: string;
  settings: object;
}

export type FullGroupData = {
  group: Group;
  groupAccesses: GroupAccess[];
};

export type GroupPreview = {
  _id: string;
  name: string;
  role: RoleName;
};

export type GroupPreviewsPagination = {
  data: GroupPreview[];
  total: number;
};

export const Roles: Record<RoleName, RoleInfo> = {
  user: { weight: 10, name: "user" },
  moderator: { weight: 20, name: "moderator" },
  admin: { weight: 30, name: "admin" },
} as const;

export type GroupWithAdditionalData = {
  _id: string;
  name: string;
  publicOffers: OfferPreview[];
  draftOffers: OfferPreview[];
  settings: object;
  groupAccesses: GroupMemberPreview[];
};

export type GroupMemberPreview = {
  accountId: string;
  name: string;
  role: RoleName;
  email: string;
};

export type RoleName = "user" | "moderator" | "admin";

export type RoleInfo = {
  weight: number;
  name: string;
};
