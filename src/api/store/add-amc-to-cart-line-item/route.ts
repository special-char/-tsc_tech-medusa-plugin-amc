import { container, MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { Modules } from "@medusajs/framework/utils";
import { refetchCart } from "@medusajs/medusa/api/store/carts/helpers";
import { addAMCToCartWorkflow } from "../../../workflows/add-amc-line-item/add-amc-line-item";

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const {
    amc_id: variant_id,
    variant_id: vId,
    quantity,
    metadata,
    cart_id,
  }: any = req.body;

  const pricingModuleService = container.resolve(Modules.PRICING);
  const query = container.resolve("query");
  const cartQuery = await query.graph({
    entity: "cart",
    filters: { id: cart_id },
    fields: ["*", "region_id", "currency_code"],
  });

  const response = await query.graph({
    entity: "amc",
    fields: [
      "*",
      "price_set.prices.*",
      "product_variants.*",
      "product_variants.product.*",
    ],
    filters: {
      id: variant_id || "",
    },
  });
  const amcData = Array.isArray(response.data)
    ? JSON.parse(JSON.stringify(response.data))
    : [];

  amcData[0].product_variants.map((pv: any, i) => {
    if (pv.id != vId) {
      delete amcData[0].product_variants[i];
    }
  });
  amcData[0].product_variants.splice(
    0,
    amcData[0].product_variants.length,
    ...amcData[0].product_variants.filter((item) => item !== null)
  );

  const amcDataId = amcData.map((amc: any) => amc.price_set.id);

  const price = await pricingModuleService.calculatePrices(
    { id: amcDataId },
    {
      context: {
        region_id: cartQuery.data[0].region_id || "",
        currency_code: cartQuery.data[0].currency_code,
      },
    }
  );
  const amcUpdate = amcData.map((amc: any) => {
    const priceData = price.find((p: any) => p.id === amc.price_set.id);
    amc.price_set.calculated_price = priceData;
    return amc;
  });

  const result = await addAMCToCartWorkflow(req.scope).run({
    input: {
      cart_id: cart_id,
      items: [{ variant_id, quantity, metadata }],
      amcUpdate,
    },
  });

  const cart = await refetchCart(cart_id, req.scope, req.queryConfig.fields);

  res.status(200).json({ cart });
};
