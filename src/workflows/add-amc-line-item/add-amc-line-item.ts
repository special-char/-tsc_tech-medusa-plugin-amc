import {
  isDefined,
  isPresent,
  MathBN,
  PriceListType,
} from "@medusajs/framework/utils";
import {
  createWorkflow,
  parallelize,
  transform,
  WorkflowData,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import {
  confirmVariantInventoryWorkflow,
  createLineItemsStep,
  getLineItemActionsStep,
  refreshCartItemsWorkflow,
  updateLineItemsStep,
  useQueryGraphStep,
  validateCartStep,
  validateLineItemPricesStep,
} from "@medusajs/medusa/core-flows";
export const productVariantsFields = [
  "id",
  "title",
  "sku",
  "manage_inventory",
  "allow_backorder",
  "requires_shipping",
  "is_discountable",
  "variant_option_values",
  "barcode",
  "product.id",
  "product.title",
  "product.description",
  "product.subtitle",
  "product.thumbnail",
  "product.type.value",
  "product.type.id",
  "product.collection.title",
  "product.handle",
  "product.discountable",
  "calculated_price.*",
  "inventory_items.inventory_item_id",
  "inventory_items.required_quantity",
  "inventory_items.inventory.requires_shipping",
  "inventory_items.inventory.location_levels.stock_locations.id",
  "inventory_items.inventory.location_levels.stock_locations.name",
  "inventory_items.inventory.location_levels.stock_locations.sales_channels.id",
  "inventory_items.inventory.location_levels.stock_locations.sales_channels.name",
];

export function prepareLineItemData(data: any) {
  const {
    item,
    variant,
    cartId,
    taxLines,
    adjustments,
    isCustomPrice,
    unitPrice,
    isTaxInclusive,
    metadata,
  } = data;

  if (variant && !variant.product_variants[0].product) {
    throw new Error("Variant does not have a product");
  }

  let compareAtUnitPrice = item?.compare_at_unit_price;

  const isSalePrice =
    variant?.calculated_price?.calculated_price?.price_list_type ===
    PriceListType.SALE;

  if (
    !isPresent(compareAtUnitPrice) &&
    isSalePrice &&
    !MathBN.eq(
      variant.calculated_price?.original_amount,
      variant.calculated_price?.calculated_amount
    )
  ) {
    compareAtUnitPrice = variant.calculated_price.original_amount;
  }

  const someInventoryRequiresShipping = variant?.inventory_items?.length
    ? variant.inventory_items.some(
        (inventoryItem) => !!inventoryItem.inventory.requires_shipping
      )
    : true;

  const requiresShipping = isDefined(item?.requires_shipping)
    ? item.requires_shipping
    : someInventoryRequiresShipping;

  let lineItem: any = {
    quantity: item?.quantity || 1,
    title: variant?.title ?? item?.title,
    subtitle: variant?.product_variants[0].product?.title ?? item?.subtitle,
    thumbnail:
      variant?.product_variants[0].product?.thumbnail ?? item?.thumbnail,

    product_id: variant?.product_variants[0].product?.id ?? item?.product_id,
    product_title:
      variant?.product_variants[0].product?.title ?? item?.product_title,
    product_description:
      variant?.product_variants[0].product?.description ??
      item?.product_description,
    product_subtitle:
      variant?.product_variants[0].product?.subtitle ?? item?.product_subtitle,
    product_type:
      variant?.product_variants[0].product?.type?.value ??
      item?.product_type ??
      null,
    product_type_id:
      variant?.product?.type?.id ?? item?.product_type_id ?? null,
    product_collection:
      variant?.product_variants[0].product?.collection?.title ??
      item?.product_collection ??
      null,
    product_handle:
      variant?.product_variants[0].product?.handle ?? item?.product_handle,

    variant_id: variant?.id,
    variant_sku: variant?.sku ?? item?.variant_sku,
    variant_barcode: variant?.barcode ?? item?.variant_barcode,
    variant_title: variant?.title ?? item?.variant_title,
    variant_option_values: item?.variant_option_values,

    is_discountable:
      variant?.product_variants[0].product?.discountable ??
      item?.is_discountable,
    requires_shipping: false,

    unit_price: unitPrice,
    compare_at_unit_price: compareAtUnitPrice,
    is_tax_inclusive: !!isTaxInclusive,

    metadata: metadata ?? {},
  };

  if (isCustomPrice) {
    lineItem.is_custom_price = !!isCustomPrice;
  }

  if (cartId) {
    lineItem.cart_id = cartId;
  }

  return lineItem;
}

export const cartFieldsForPricingContext = [
  "id",
  "sales_channel_id",
  "currency_code",
  "region_id",
  "shipping_address.city",
  "shipping_address.country_code",
  "shipping_address.province",
  "shipping_address.postal_code",
  "item_total",
  "total",
  "customer.id",
  "email",
  "customer.groups.id",
];

const cartFields = ["completed_at"].concat(cartFieldsForPricingContext);
export const addAMCToCartWorkflow = createWorkflow(
  "add-amc-to-cart",
  (input: WorkflowData<any>) => {
    const cartQuery: any = useQueryGraphStep({
      entity: "cart",
      filters: { id: input.cart_id },
      fields: cartFields,
      options: { throwIfKeyNotFound: true },
    }).config({ name: "get-cart" });

    const cart = transform({ cartQuery }, ({ cartQuery }) => {
      return cartQuery.data[0];
    });
    validateCartStep({ cart });

    const variantIds = transform({ input }, (data) => {
      return (data.input.items ?? []).map((i) => i.variant_id).filter(Boolean);
    });
    const variants = input.amcUpdate;

    const lineItems = transform({ input, variants }, (data) => {
      const items = (data.input.amcUpdate ?? []).map((item) => {
        const variant = (data.variants ?? []).find((v) => v.id === item.id)!;

        const input: any = {
          item,
          variant: variant,
          cartId: data.input.cart_id,
          unitPrice: item.price_set?.calculated_price?.calculated_amount,
          isTaxInclusive:
            item.is_tax_inclusive ??
            variant?.calculated_price?.is_calculated_price_tax_inclusive,
          isCustomPrice: isDefined(
            item?.price_set?.calculated_price?.calculated_amount
          ),
          metadata: data.input.items[0].metadata,
          quantity: data.input.quantity,
        };

        if (variant && !input.unitPrice) {
          input.unitPrice = variant.calculated_price?.calculated_amount;
        }

        return prepareLineItemData(input);
      });

      return items;
    });

    validateLineItemPricesStep({ items: lineItems });

    const { itemsToCreate = [], itemsToUpdate = [] } = getLineItemActionsStep({
      id: cart.id,
      items: lineItems,
    });

    confirmVariantInventoryWorkflow.runAsStep({
      input: {
        sales_channel_id: cart.sales_channel_id || "",
        variants,
        items: input.items,
        itemsToUpdate,
      },
    });

    parallelize(
      createLineItemsStep({
        id: cart.id,
        items: itemsToCreate,
      }),
      updateLineItemsStep({
        id: cart.id,
        items: itemsToUpdate,
      })
    );

    refreshCartItemsWorkflow.runAsStep({
      input: { cart_id: cart.id },
    });

    return new WorkflowResponse({ cart_id: cart.id });
  }
);
