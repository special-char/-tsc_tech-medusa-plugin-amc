import { PricingTypes } from "@medusajs/framework/types";
import {
	createWorkflow,
	WorkflowData,
	WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import { updatePriceSetsStep } from "@medusajs/medusa/core-flows";

export type UpdatePriceSet =
	| {
			/**
			 * The filters to select which price sets to update.
			 */
			selector?: PricingTypes.FilterablePriceSetProps;
			/**
			 * The data to update the price sets with.
			 */
			update?: PricingTypes.UpdatePriceSetDTO;
	  }
	| {
			/**
			 * The price sets to update.
			 */
			price_sets: PricingTypes.UpsertPriceSetDTO[];
	  };

export const updateProductAMCWorkflow = createWorkflow(
	"update-product-amc",
	(input: WorkflowData<UpdatePriceSet>) => {
		const createdPriceSets = updatePriceSetsStep(input as any);

		return new WorkflowResponse(createdPriceSets);
	}
);
