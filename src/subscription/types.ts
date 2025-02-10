import { PaymentStatus } from "./dto/payment-status.enum";

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
