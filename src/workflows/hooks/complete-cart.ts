import { container } from "@medusajs/framework";
import { MedusaError } from "@medusajs/framework/utils";
import { completeCartWorkflow } from "@medusajs/medusa/core-flows";

//TODO:: test pending for customer past order
completeCartWorkflow.hooks.validate(async (context): Promise<void> => {
  const { cart } = context;
  if (cart.customer_id) {
    const itemVariantIds = cart.items.map((item) => item.variant_id);
    const query = container.resolve("query");

    for (const id of itemVariantIds) {
      // Skip if the ID already contains "variant"
      if (id.includes("variant")) continue;

      try {
        // Fetch variant data
        const variantData = await query.graph({
          entity: "amc",
          fields: ["*", "product_variants.*"],
          filters: { id },
        });

        if (variantData.data[0]) {
          const productVariantId =
            variantData.data[0].product_variants?.map((v) => v?.id) || [];

          // Check if the product variant ID is already in the cart
          if (
            itemVariantIds.filter((item1) =>
              productVariantId.some((item2) => item1.id === item2)
            )
          ) {
            return;
          }

          // Check customer's previous orders for the variant ID
          if (cart.customer_id) {
            const orderData = await query.graph({
              entity: "order",
              fields: ["*", "items.*"],
              filters: { customer_id: cart.customer_id },
            });

            for (const order of orderData.data) {
              const hasPurchased = order.items?.filter((i) =>
                productVariantId.some((i2) => i?.variant_id === i2)
              );
              if (hasPurchased) {
                return;
              }
            }
          }
        }
      } catch (error) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          "Error while validating product variant."
        );
      }
    }

    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Product not found in the cart or previous orders"
    );
  }
});
