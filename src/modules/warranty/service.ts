import { MedusaService } from "@medusajs/framework/utils";
import { ProductWarrantyTerms } from "./models/product-warranty-terms";
import { WarrantyTransactions } from "./models/warranty-transaction";
class WarrantyModuleService extends MedusaService({
  ProductWarrantyTerms,
  WarrantyTransactions,
}) {}

export default WarrantyModuleService;
