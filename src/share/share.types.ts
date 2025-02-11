export type JwtTokenPayload = {
  userId: string;
  superAccess?: boolean;
};

export enum PaymentSystems {
  STRIPE = "stripe",
  YOO_MONEY = "yoo_money",
}

export type SalesTier = {
  _id: string;
  name: string;
  duration: number;
  price: number;
  base_tier: string;
  sales_price?: number;
  expiration_date?: Date;
};