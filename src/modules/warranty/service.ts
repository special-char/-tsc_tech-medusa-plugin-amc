import { MedusaService } from "@medusajs/framework/utils";
import { ProductWarrantyTerms } from "./models/product-warranty-terms";
import { CustomerWarranties } from "./models/warranties";
import { WarrantyTransactions } from "./models/warranty-transaction";
class WarrantyModuleService extends MedusaService({
	ProductWarrantyTerms,
	CustomerWarranties,
	WarrantyTransactions
}) { }

export default WarrantyModuleService;
