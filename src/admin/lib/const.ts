import { sdk } from "./sdk";

export const transformPrices = async (prices: { [key: string]: string }) => {
  const result = [] as any[];
  for (const [key, amount] of Object.entries(prices)) {
    const regionToCurrencyMap = {} as Record<string, string>;
    if (amount && !isNaN(parseInt(amount))) {
      if (key.startsWith("reg_")) {
        const region = await sdk.admin.region.retrieve(key);
        regionToCurrencyMap[key] = region.region.currency_code;
        if (regionToCurrencyMap?.[key].trim()) {
          result.push({
            rules: {
              region_id: key,
            },
            currency_code: regionToCurrencyMap?.[key],
            amount: parseInt(amount),
          });
        }
      } else {
        result.push({
          currency_code: key.toLowerCase(),
          amount: parseInt(amount),
        });
      }
    }
  }
  return result;
};

export const reverseTransformPrices = (
  apiPrices: {
    id: string;
    title: string | null;
    currency_code: string;
    min_quantity: string | null;
    max_quantity: string | null;
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
    price_rules: { value: string }[];
    amount: number;
  }[]
) => {
  return apiPrices?.reduce((acc, price) => {
    if (
      (price.amount && price.amount > 0) ||
      (price.raw_amount?.value && parseInt(price.raw_amount?.value) > 0)
    ) {
      if (price?.rules_count > 0 && price?.price_rules?.length > 0) {
        const regionId = price?.price_rules?.[0]?.value;
        acc[regionId] = price?.raw_amount?.value;
      } else {
        acc[price.currency_code] = price?.raw_amount?.value;
      }
    }
    return acc;
  }, {} as Record<string, string>);
};
