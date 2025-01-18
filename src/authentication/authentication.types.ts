export type AuthenticationData = {
  email: string;
  password: string;
};

export type UserData = AuthenticationData & {
  name: string;
};

export type User = UserData & {
  _id: string;
  lastPasswords: string[];
  subscription: null;
  publicOffers: string[];
  draftOffers: string[];
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
