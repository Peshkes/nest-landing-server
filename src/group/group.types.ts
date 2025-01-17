export type GroupAccess = {
  group_id: string;
  user_id: string;
  role: Roles;
};

export type Group = {
  _id?: string;
  name: string;
  publicOffers: string[];
  draftOffers: string[];
  settings: object;
};

export type FullGroupData = {
  group: Group;
  groupAccesses: GroupAccess[];
};

export type GroupPreview = {
  _id: string;
  name: string;
  role: Roles;
};

export enum Roles {
  USER = 10,
  MODERATOR = 20,
  ADMIN = 30,
}
