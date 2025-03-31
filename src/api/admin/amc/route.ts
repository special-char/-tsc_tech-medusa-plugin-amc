import { container } from "@medusajs/framework";
import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

import {
  AdditionalData,
  HttpTypes,
  LinkDefinition,
} from "@medusajs/framework/types";
import { Modules } from "@medusajs/framework/utils";
import AMCModuleService from "../../../modules/amc/service";
import { AMC_MODULE } from "../../../modules/amc";
import { createProductAMCWorkflow } from "../../../workflows/create-amc/create-amc";

export const POST = async (
  req: MedusaRequest<
    HttpTypes.AdminUpdateProductVariant & AdditionalData & any
  >,
  res: MedusaResponse
) => {
  const { variant_id, title, sku, barcode, prices, duration } = req.body;
  // first store amc details
  const amcService: AMCModuleService = req.scope.resolve(AMC_MODULE);

  const amc = await amcService.createAmcs({
    title,
    sku,
    barcode,
    duration,
  });
  // add product amc link
  const remoteLink = container.resolve("remoteLink");
  const links: LinkDefinition[] = [];
  variant_id?.map((v_id: string) =>
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

  const { result } = await createProductAMCWorkflow(req.scope).run({
    input: prices,
  });

  await remoteLink.create([
    {
      [AMC_MODULE]: {
        amc_id: amc.id,
      },
      [Modules.PRICING]: {
        price_set_id: result[0].id,
      },
    },
  ]);
  const query = req.scope.resolve("query");
  const amcData = await query.graph({
    entity: "amc",
    fields: ["*", "price_set.prices.*"],
    filters: { id: amc.id },
  });
  res.send(amcData);
};

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const query = req.scope.resolve("query");
  const amc = await query.graph({
    entity: "amc",
    fields: [
      "*",
      "price_set.prices.*",
      "product_variants.*",
      "price_set.prices.price_rules.value",
    ],
  });
  res.send(amc);
};
