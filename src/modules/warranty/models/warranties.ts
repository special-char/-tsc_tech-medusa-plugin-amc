import { model } from "@medusajs/framework/utils"

export const CustomerWarranties = model.define("customer-warranties", {
    id: model.id().primaryKey(),
    variant_id: model.text(),
    customer_id: model.text(),
})

