export type PaymentCheckData = {
  _id: string;
  sum: number;
  duration?: number;
  status: PaymentStatus;
};

export type SalesTier = {
  _id: string;
  name: string;
  duration: number;
  price: number;
  base_tier: string;
  sales_price?: number;
  expiration_date?: Date;
};

export enum PaymentSystems {
  STRIPE = "stripe",
  YOO_MONEY = "yoo_money",
}

export enum PaymentStatus {
  INITIALIZED = "initialized",
  SUCCESS = "success",
  PENDING = "pending",
  FAILED = "failed",
}
