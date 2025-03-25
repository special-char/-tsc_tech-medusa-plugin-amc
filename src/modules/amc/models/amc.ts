import { model } from "@medusajs/framework/utils";

export const Amc = model.define("amc", {
  id: model.id().primaryKey(),
  title: model.text(),
  sku: model.text(),
  barcode: model.text(),
  duration: model.number().default(0),
});
