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

export type StatusInfo = {
  weight: number;
  name: string;
};

export const Statuses: Record<string, StatusInfo> = {
  init: { weight: 10, name: "init" },
  success: { weight: 20, name: "success" },
  pend: { weight: 30, name: "pending" },
  failed: { weight: 40, name: "failed" },
} as const;
