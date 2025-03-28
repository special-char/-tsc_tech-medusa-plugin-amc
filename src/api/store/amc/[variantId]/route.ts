import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
	const query = req.scope.resolve("query");
	const { variantId } = req.params;
	const amc = await query.graph({
		entity: "product",
		fields: ["*", "variants.*", "variants.amc.*"],
		filters: {
			variants: {
				id: variantId,
			},
		},
	});

	amc.data;
	res.send({
		amc: amc.data,
		count: amc.metadata?.count,
		limit: amc.metadata?.take,
		offset: amc.metadata?.skip,
	});
};
