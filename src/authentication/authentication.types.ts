import { OfferManager } from "../share/interfaces/offer-manager";
import { v4 as uuidv4 } from "uuid";

export interface AuthenticationData {
  email: string;
  password: string;
}

export interface UserData extends AuthenticationData {
  name: string;
}

export interface User extends UserData, OfferManager {
  _id: string;
  last_passwords: string[];
  subscription?: string;
  email_verified: boolean;
  phone: string;
  deleted: boolean;
  deletion_date: Date;
}

export interface SuperUser {
  _id: string;
  name: string;
  email: string;
  password: string;
  lastPasswords: Array<string>;
}

export type Tokens = {
  accessToken: string;
  refreshToken: string;
};

export type SignInResponse = {
  user: PublicUserData;
  tokens: Tokens;
};

export type PublicUserData = {
  email: string;
  name: string;
  _id: string;
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
