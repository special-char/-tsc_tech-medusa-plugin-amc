import { Module } from "@medusajs/framework/utils";
import AMCModuleService from "./service";

export const AMC_MODULE = "amc";

export default Module(AMC_MODULE, {
	service: AMCModuleService,
});
