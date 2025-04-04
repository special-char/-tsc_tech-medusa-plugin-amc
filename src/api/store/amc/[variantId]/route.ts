import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { Modules } from "@medusajs/framework/utils";

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const query = req.scope.resolve("query");
    const { variantId } = req.params;
    const { regionId, currencyCode } = req.query;
    if (!regionId || !currencyCode) {
      return res
        .send({
          message: "Region ID and Currency Code are required",
        })
        .status(400);
    }
    if (!variantId) {
      return res
        .send({
          message: "Variant ID is required",
        })
        .status(400);
    }
    const { data } = await query.graph({
      entity: "product_variants",
      fields: ["*", "amc.*", "amc.price_set.prices.*"],
      filters: {
        id: variantId,
      },
    });
    if (!data[0]) {
      return res
        .send({
          message: "Variant not found",
        })
        .status(404);
    }
    const pricingModuleService = req.scope.resolve(Modules.PRICING);
    const amcData = [data?.[0]?.amc].flat();
    const price = await pricingModuleService.calculatePrices(
      { id: amcData.map((x) => x.price_set.id) },
      {
        context: {
          region_id: regionId as string,
          currency_code: currencyCode as string,
        },
      }
    );
    res.send({
      data: [data?.[0]?.amc].flat().map((amc) => ({
        ...amc,
        price: price.find((x) => x.id === amc.price_set.id),
      })),
      // price,
    });
  } catch (error) {
    res.status(500).send(error);
  }
};
