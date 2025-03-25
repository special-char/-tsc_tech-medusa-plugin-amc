import { SubscriberArgs, type SubscriberConfig } from "@medusajs/medusa";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";
import { WARRANTY_MODULE } from "../modules/warranty";
import WarrantyModuleService from "../modules/warranty/service";
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
      throw new Error(`Product not found for ID: ${data.id}`);
    }
    const warrantyModuleService: WarrantyModuleService =
      container.resolve(WARRANTY_MODULE);
    const warranty = await warrantyModuleService.deleteProductWarrantyTerms(
      p.data[0].product_warranty_terms.id
    );

    const remoteLink = container.resolve("remoteLink");
    await remoteLink.delete({
      [Modules.PRODUCT]: {
        product_variant_id: p.data[0].id,
      },
      [WARRANTY_MODULE]: {
        product_warranty_terms_id: p.data[0].product_warranty_terms.id,
      },
    });
  } catch (error) {
    console.error(`Error handling product deletion for ID ${data.id}:`, error);
  }
}

export const config: SubscriberConfig = {
  event: "product-variant.deleted",
};
