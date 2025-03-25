import ProductModule from "@medusajs/medusa/product";
import { defineLink } from "@medusajs/framework/utils";
import AMCModule from "../modules/amc";

export default defineLink(AMCModule.linkable.amc, {
	linkable: ProductModule.linkable.productVariant,
	isList: true,
});
