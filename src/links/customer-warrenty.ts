import CustomerModule from "@medusajs/medusa/customer";
import { defineLink } from "@medusajs/framework/utils";
import WarrantyModule from "../modules/warranty";
export default defineLink(
  CustomerModule.linkable.customer,
  WarrantyModule.linkable.warrantyTransactions
);
