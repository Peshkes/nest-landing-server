export type PaymentCheckData = {
  _id: string;
  sum: number;
  duration?: number;
  status: PaymentStatus;
};

export enum PaymentStatus {
  INITIALIZED = "initialized",
  SUCCESS = "success",
  PENDING = "pending",
  FAILED = "failed",
}

export interface Payment {
  _id: string;
  sum: number;
  status: PaymentStatus;
  payment_system: PaymentStatus;
  description?: string;
  payment_details?: object;
}

export interface Subscription {
  _id: string;
  tier_id: string;
  key: string;
  start_date: Date;
  expiration_date: Date;
  is_active: boolean;
  payments_ids: string[];
  description?: string;
}
