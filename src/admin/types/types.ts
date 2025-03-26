type AMCType = {
  variant_id: string[];
  title: string;
  sku: string;
  barcode: string;
  prices: AMCPrice[];
};
type AMCPrice = {
  currency_code: string;
  amount: number;
};
type AMCPriceRawAmount = {
  id: string;
  title: null;
  currency_code: string;
  min_quantity: number | null;
  max_quantity: number | null;
  rules_count: number;
  price_set_id: string;
  price_list_id: string | null;
  price_list: string | null;
  raw_amount: {
    value: string;
    precision: number;
  };
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  amount: number;
};
type AMCProps = {
  id: string;
  title: string;
  sku: string;
  barcode: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  price_set: {
    id: string;
    prices: AMCPriceRawAmount[];
  };
};

type UPDATE_AMC_TYPE = {
  title?: string;
  sku?: string;
  barcode?: string;
  prices?: AMCPrice[];
  variant_id?: string[];
};

export type { AMCType, AMCPrice, AMCPriceRawAmount, AMCProps, UPDATE_AMC_TYPE };
