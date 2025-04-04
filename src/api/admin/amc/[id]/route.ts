import { container } from "@medusajs/framework";
import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import {
  AdditionalData,
  HttpTypes,
  LinkDefinition,
} from "@medusajs/framework/types";
import { Modules } from "@medusajs/framework/utils";
import AMCModuleService from "../../../../modules/amc/service";
import { AMC_MODULE } from "../../../../modules/amc";
import { updateProductAMCWorkflow } from "../../../../workflows/ update-amc-price/update-amc-price";

export const POST = async (
  req: MedusaRequest<
    HttpTypes.AdminUpdateProductVariant & AdditionalData & any
  >,
  res: MedusaResponse
) => {
  const { variant_id, prices, ...rest } = req.body;

  const amcService: AMCModuleService = req.scope.resolve(AMC_MODULE);

  const amc = await amcService.updateAmcs({
    id: req.params.id,
    ...rest,
  });

  const remoteLink = container.resolve("remoteLink");

  // first list all existing variant and take difference to get the new variant and delete the not existing variant
  const query = req.scope.resolve("query");
  const linkData = await query.graph({
    entity: "amc",
    fields: ["*", "product_variants.id", "price_set.id"],
    filters: {
      id: req.params.id,
    },
  });
  if (variant_id) {
    const existingVariant =
      linkData.data[0].product_variants?.map((v) => v?.id) || [];

    const newVariant = variant_id.filter((v) => !existingVariant.includes(v));
    const deleteVariant = existingVariant.filter(
      (v) => !variant_id.includes(v)
    );

    const links: LinkDefinition[] = [];
    newVariant?.map((v_id: string) =>
      links.push({
        [AMC_MODULE]: {
          amc_id: amc.id,
        },
        [Modules.PRODUCT]: {
          product_variant_id: v_id,
        },
      })
    );

    await remoteLink.create(links);

    deleteVariant?.map((v_id: string) =>
      remoteLink.dismiss({
        [AMC_MODULE]: {
          amc_id: amc.id,
        },
        [Modules.PRODUCT]: {
          product_variant_id: v_id,
        },
      })
    );
  }
  const priceSetId = linkData.data[0]?.price_set?.id;
  if (priceSetId) {
    await updateProductAMCWorkflow(req.scope).run({
      input: {
        price_sets: [{ id: priceSetId, prices }],
      },
    });
  }

  const amcData = await query.graph({
    entity: "amc",
    fields: ["*", "price_set.prices.*", "product_variants.*"],
    filters: { id: amc.id },
  });
  res.send(amcData);
};
