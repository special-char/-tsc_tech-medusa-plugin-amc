import { SubscriberArgs, type SubscriberConfig } from "@medusajs/medusa";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";
import { WARRANTY_MODULE } from "../modules/warranty";
import WarrantyModuleService from "../modules/warranty/service";
import { LinkDefinition } from "@medusajs/framework/types";

export default async function productCreateHandler({
  event: { data },
  container,
}: SubscriberArgs<{
  [x: string]: any;
  entity_id: string;
}>) {
  try {
    const query = container.resolve(ContainerRegistrationKeys.QUERY);
    const p = await query.graph({
      entity: "product_variant",
      filters: {
        id: data.id,
      },
      fields: ["*", "product_warranty_terms.*"],
    });
    if (!p.data[0]) {
      throw new Error(`variant not found for ID: ${data.id}`);
    }
    if (p.data[0].metadata?.days && p.data[0].metadata?.service_interval) {
      const warrantyModuleService: WarrantyModuleService =
        container.resolve(WARRANTY_MODULE);
      if (
        p.data[0].product_warranty_terms &&
        p.data[0].product_warranty_terms.id
      ) {
        const warranty = await warrantyModuleService.updateProductWarrantyTerms(
          {
            id: p.data[0].product_warranty_terms.id,
            product_id: p.data[0].id, // will need to change variant_id to product_id
            days: p.data[0].metadata.days,
            service_interval: p.data[0].metadata.service_interval,
            variant_id: p.data[0].id,
          }
        );
      } else {
        const warranty = await warrantyModuleService.createProductWarrantyTerms(
          {
            product_id: p.data[0].id, // will need to change variant_id to product_id
            variant_id: p.data[0].id,
            days: p.data[0].metadata.days,
            service_interval: p.data[0].metadata.service_interval,
          }
        );

        const remoteLink = container.resolve("remoteLink");

        const links: LinkDefinition[] = [];

        links.push({
          [Modules.PRODUCT]: {
            product_variant_id: p.data[0].id,
          },
          [WARRANTY_MODULE]: {
            product_warranty_terms_id: warranty.id,
          },
        });
        await remoteLink.create(links);
      }
    }
  } catch (error) {
    console.error(`Error handling product update for ID ${data.id}:`, error);
  }
}

export const config: SubscriberConfig = {
  event: "product-variant.updated",
};
