import { container } from "@medusajs/framework";
import { MedusaError } from "@medusajs/framework/utils";
import { completeCartWorkflow } from "@medusajs/medusa/core-flows";

completeCartWorkflow.hooks.validate(async (context): Promise<void> => {
  const { cart } = context;

  const itemVariantIds = cart.items.map((item) => item.variant_id);
  if (!cart.customer_id) {
    const amcItems = itemVariantIds.filter((id) => id.includes("amc"));

    if (amcItems.length !== 0) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "You can't buy amc."
      );
    }
    return;
  } // No need to check if there's no customer

  const query = container.resolve("query");

  // Check if cart contains AMC items
  const amcItems = itemVariantIds.filter((id) => !id.includes("variant"));

  // If the cart only contains product variants (no AMC items), skip validation
  if (amcItems.length === 0) {
    return;
  }
  let invalidAmcFound = false; // Track if any AMC is invalid

  // Fetch the user's past orders first
  const orderData = await query.graph({
    entity: "order",
    fields: ["*", "items.variant_id"],
    filters: { customer_id: cart.customer_id },
  });

  const pastVariantIds = new Set(
    orderData.data?.flatMap((order) => order.items.map((i) => i.variant_id)) ||
      []
  );

  for (const id of amcItems) {
    try {
      // Fetch AMC details
      const { data: amcData } = await query.graph({
        entity: "amc",
        fields: ["*", "product_variants.id"],
        filters: { id },
      });

      if (amcData[0]) {
        const productVariantIds = new Set(
          amcData[0].product_variants?.map((v) => v.id) || []
        );

        // Check if the product variant ID is already in the cart
        const foundInCart = itemVariantIds.some((cartId) =>
          productVariantIds.has(cartId)
        );

        // Check past orders for a matching product variant
        const hasPurchasedBefore = [...productVariantIds].some((variantId) =>
          pastVariantIds.has(variantId)
        );

        if (!foundInCart && !hasPurchasedBefore) {
          invalidAmcFound = true; // This AMC is invalid
          break; // No need to check further, exit loop
        }
      }
    } catch (error) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Error while validating product variant."
      );
    }
  }

  // If any invalid AMC was found, block the purchase
  if (invalidAmcFound) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "You can only purchase an AMC if you have previously bought the associated product or are purchasing it now."
    );
  }
});
