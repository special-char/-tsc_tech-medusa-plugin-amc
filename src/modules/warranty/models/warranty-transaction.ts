import { model } from "@medusajs/framework/utils";

export const WarrantyTransactions = model.define("warranty_transactions", {
  id: model.id({ prefix: "warranty" }).primaryKey(),
  start_date: model.dateTime(),
  end_date: model.dateTime(),
  duration_days: model.number(),
  order_id: model.text(),
  order_line_item_id: model.text(),
  product_id: model.text(),
  variant_id: model.text(),
  customer_id: model.text(),
  amc_id: model.text(),
});
