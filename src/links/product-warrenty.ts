
import ProductModule from "@medusajs/medusa/product"
import { defineLink } from "@medusajs/framework/utils"
import WarrantyModule from "../modules/warranty"
export default defineLink(
    ProductModule.linkable.productVariant,
    WarrantyModule.linkable.productWarrantyTerms
)
