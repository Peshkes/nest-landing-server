export type PaymentCheckData = {
  payment_id: string;
  sum: number;
  duration: number;
};

export type SalesTier = {
  _id: string;
  name: string;
  duration: number;
  price: number;
  base_tier: string;
  sales_price: number;
  expiration_date: Date;
};
