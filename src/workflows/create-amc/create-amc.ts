import { CreatePriceSetDTO } from "@medusajs/framework/types";
import {
	createWorkflow,
	WorkflowData,
	WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import { createPriceSetsStep } from "@medusajs/medusa/core-flows";
export type CreateProductAMCWorkflowInput = CreatePriceSetDTO[];
export const createProductAMCWorkflow = createWorkflow(
	"create-product-amc",
	(input: WorkflowData<CreateProductAMCWorkflowInput>) => {
		const createdPriceSets = createPriceSetsStep([{ prices: input }] as any);

		return new WorkflowResponse(createdPriceSets);
	}
);
