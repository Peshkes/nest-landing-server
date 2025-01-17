import { ObjectId } from "mongoose";

export type AuthenticationData = {
  email: string;
  password: string;
};

export type UserData = AuthenticationData & {
  name: string;
};

export type User = UserData & {
  superUser: boolean;
  _id: ObjectId;
  lastPasswords: string[];
  subscription: null;
  publicOffers: string[];
  draftOffers: string[];
};

export type PublicUserData = {
  email: string;
  name: string;
  _id: ObjectId;
};

export type AuthenticationResult = {
  accessToken: string;
  refreshToken: string;
};

export type CustomCookies = {
  cookies: {
    accessToken: string;
    refreshToken: string;
  };
};

export type JwtTokenPayload = {
  userId: string;
};

export type MoveOffersRequest = {
  publicOffersToMove: string[];
  draftOffersToMove: string[];
};

export type EmailToSend = {
  from: string | "no_reply@snapitch.com";
  to: string;
  subject: string;
  text: string;
  link?: string;
  html: string;
};

export type ResetPasswordObject = {
  userId: string;
  token: string;
  newPassword: string;
};
