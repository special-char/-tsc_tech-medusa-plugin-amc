import { defineLink } from "@medusajs/framework/utils";
import AMCModule from "../modules/amc";
import PricingModule from "@medusajs/medusa/pricing";

export default defineLink(
	AMCModule.linkable.amc,
	PricingModule.linkable.priceSet
);
