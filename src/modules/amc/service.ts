import { MedusaService } from "@medusajs/framework/utils";
import { Amc } from "./models/amc";

class AMCModuleService extends MedusaService({
	Amc,
}) {}

export default AMCModuleService;
