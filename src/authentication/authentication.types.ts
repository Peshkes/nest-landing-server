import { OfferManager } from "../share/interfaces/offer-manager";

export interface AuthenticationData {
  email: string;
  password: string;
}

export interface UserData extends AuthenticationData {
  name: string;
}

export interface SuperUser extends UserData {
  _id: string;
  last_passwords: Array<string>;
}

export interface User extends OfferManager, SuperUser {
  subscription?: string;
  email_verified: boolean;
  phone: string;
  deleted: boolean;
  deletion_date: Date;
}

export interface TokenData {
  _id: string;
  token: string;
  createdAt: Date;
}

export type Tokens = {
  accessToken: string;
  refreshToken: string;
};

export type SignInResponse = {
  user: PublicUserData;
  tokens: Tokens;
};

export type PublicUserData = Pick<User, "_id" | "email" | "name" | "email_verified">;

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
