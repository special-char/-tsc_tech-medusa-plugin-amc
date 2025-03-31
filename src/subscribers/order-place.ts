import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import WarrantyModuleService from "../modules/warranty/service";

export default async function order1PlacedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const { id } = data;

  const query = container.resolve("query");
  const warrantyService: WarrantyModuleService = container.resolve("warranty");

  // Fetch order with items
  const { data: order } = await query.graph({
    entity: "order",
    fields: ["*", "items.*", "customer.*"],
    filters: { id: id },
  });

  if (!order || order.length === 0) return;

  const orderItems = order[0].items || [];
  const customerId = order[0].customer_id;

  if (!customerId) return;

  let productWarranties: any[] = [];
  let amcItems: any[] = [];

  for (const item of orderItems) {
    const variantId = item?.variant_id || (item?.metadata?.amc_id as string);
    const quantity = item?.quantity || 1; // Ensure we check the quantity

    let duration;
    let type;

    if (variantId?.includes("variant")) {
      // Fetch variant warranty details
      const { data: variant } = await query.graph({
        entity: "product_variant",
        fields: ["*", "product_warranty_terms.*"],
        filters: { id: variantId },
      });

      if (variant && variant.length > 0) {
        duration = variant[0].product_warranty_terms?.days || 0;
        type = "warranty";

        for (let i = 0; i < quantity; i++) {
          productWarranties.push({
            variantId,
            duration,
            type,
            itemId: item.id,
            productId: item.product_id,
          });
        }
      }
    } else if (variantId?.includes("amc")) {
      // Fetch AMC details
      const { data: amc } = await query.graph({
        entity: "amc",
        fields: ["*"],
        filters: { id: variantId },
      });

      if (amc && amc.length > 0) {
        duration = amc[0].duration || 0;
        type = "amc";
        let productVariantId = item?.metadata?.variant_id;

        for (let i = 0; i < quantity; i++) {
          amcItems.push({
            amcId: variantId,
            variantId: productVariantId,
            duration,
            type,
            itemId: item?.metadata?.order_line_item_id,
            orderLineItemId: item?.metadata?.order_line_item_id,
            productId: item.product_id,
          });
        }
      }
    }
  }

  // Step 1: Insert product warranties based on quantity
  for (const warranty of productWarranties) {
    let startDate = new Date();
    let endDate = new Date(
      startDate.getTime() + warranty.duration * 24 * 60 * 60 * 1000
    );

    await warrantyService.createWarrantyTransactions({
      start_date: startDate,
      end_date: endDate,
      duration_days: warranty.duration,
      order_id: order[0].id,
      variant_id: warranty.variantId,
      product_id: warranty.productId,
      customer_id: customerId,
      amc_id: "",
      order_line_item_id: warranty.itemId,
    });
  }

  // Step 2: Process AMC warranties, ensuring they start **one after another** if quantity > 1
  let lastEndDate = new Date(); // Track when the last AMC ended

  for (const amc of amcItems) {
    let startDate = lastEndDate;
    let endDate = new Date(
      startDate.getTime() + amc.duration * 24 * 60 * 60 * 1000
    );

    // Check if a warranty exists for this product variant
    const { data: existingWarranty } = await query.graph({
      entity: "warranty_transactions",
      fields: ["*"],
      filters: {
        variant_id: amc.variantId,
        customer_id: customerId,
        order_line_item_id: amc.orderLineItemId,
      },
    });

    if (existingWarranty && existingWarranty.length > 0) {
      let latestEndDate = existingWarranty.reduce((latest, warranty) => {
        let warrantyEndDate = new Date(warranty.end_date);
        return warrantyEndDate > latest ? warrantyEndDate : latest;
      }, new Date(0));

      startDate = latestEndDate;
      endDate = new Date(
        startDate.getTime() + amc.duration * 24 * 60 * 60 * 1000
      );
    }

    await warrantyService.createWarrantyTransactions({
      start_date: startDate,
      end_date: endDate,
      duration_days: amc.duration,
      order_id: order[0].id,
      variant_id: amc.variantId || "",
      product_id: amc.productId,
      customer_id: customerId,
      amc_id: amc.amcId,
      order_line_item_id: amc.itemId,
    });

    lastEndDate = endDate; // Update lastEndDate to chain AMCs
  }
}

export const config: SubscriberConfig = {
  event: "order.placed",
};
