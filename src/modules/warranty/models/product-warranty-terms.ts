import { model } from "@medusajs/framework/utils"

export const ProductWarrantyTerms = model.define("product_warranty_terms", {
    id: model.id().primaryKey(),
    days: model.number().default(0),
    service_interval: model.number().default(0),
    product_id: model.text(),
    variant_id: model.text(),
})

