import {
  Button,
  Checkbox,
  clx,
  createDataTableColumnHelper,
  DataTable,
  Heading,
  useDataTable,
} from "@medusajs/ui";
import { sdk } from "../../lib/sdk";
import { useVariantTableQuery } from "../../hooks/use-variant-table-query";
import { QueryKey, useQuery, UseQueryOptions } from "@tanstack/react-query";
import { Spinner } from "@medusajs/icons";
import { useVariantPriceGridColumns } from "../../hooks/use-variant-price-grid";
import { HttpTypes } from "@medusajs/framework/types";
import { FetchError } from "@medusajs/js-sdk";
import { UseFormReturn } from "react-hook-form";

type Props = {
  form: UseFormReturn<any, any, undefined>;
};
const VARIANT_PAGE_SIZE = 9;
const VARIANT_PREFIX = "variant";

const columnHelper = createDataTableColumnHelper<any>();
const columns = (props: Props) => [
  // columnHelper.select({
  //   header: ({ table }) => (
  //     <Checkbox
  //       checked={
  //         table.getIsAllRowsSelected()
  //           ? true
  //           : table.getIsSomeRowsSelected()
  //           ? "indeterminate"
  //           : false
  //       }
  //       onCheckedChange={(value) => {
  //         table.toggleAllRowsSelected(!!value);
  //       }}
  //     />
  //   ),
  //   cell: ({ row }) => (
  //     <Checkbox
  //       checked={row.getIsSelected()}
  //       onCheckedChange={(value) => row.toggleSelected(!!value)}
  //       onClick={(e) => {
  //         e.stopPropagation();
  //       }}
  //     />
  //   ),
  // }),
  columnHelper.accessor("title", {
    header: () => <span>Variant</span>,
    cell: ({ row }) => <span className="">{row.original?.title}</span>,
  }),
];
export const usePricePreferences = (
  options?: Omit<
    UseQueryOptions<
      HttpTypes.AdminPricePreferenceListResponse,
      FetchError,
      HttpTypes.AdminPricePreferenceListResponse,
      QueryKey
    >,
    "queryKey" | "queryFn"
  >
) => {
  const { data, ...rest } = useQuery({
    queryFn: () => sdk.admin.pricePreference.list({}),
    queryKey: ["price-preferences"],
    ...options,
  });

  return { data, ...rest };
};
const useRegions = () => {
  const { data, ...rest } = useQuery({
    queryFn: () => sdk.admin.region.list(),
    queryKey: ["regions"],
  });
  return { data, ...rest };
};

const VariantPricingForm = (props: Props) => {
  const { searchParams: variantSearchParams } = useVariantTableQuery({
    pageSize: VARIANT_PAGE_SIZE,
    prefix: VARIANT_PREFIX,
  });
  const { data: regions } = useRegions();
  const { data: pricePreferences } = usePricePreferences();
  const { data: variants, isLoading } = useQuery<{
    variants: [];
    count: number;
    limit: number;
    offset: number;
  }>({
    queryFn: () =>
      sdk.client.fetch(`/admin/product-variants`, {
        headers: {},
        query: {
          ...variantSearchParams,
        },
      }),
    queryKey: ["product-variants"],
    staleTime: 30000,
  });
  const priceColumns = useVariantPriceGridColumns({
    currencies: regions?.regions?.map((r) => r.currency_code),
    regions: regions?.regions,
    form: props.form,
  });
  const table = useDataTable({
    columns: priceColumns,
    data: [
      {
        title: props.form.getValues("title"),
        sku: props.form.getValues("sku"),
        barcode: props.form.getValues("barcode"),
        price: 100,
      },
    ],
  });

  return (
    <div>
      <DataTable instance={table}>
        <DataTable.Toolbar className="flex justify-between items-center">
          <Heading>Amc Pricing</Heading>
          <Button size="small" variant="secondary" asChild></Button>
        </DataTable.Toolbar>
        {isLoading ? (
          <div className="flex items-center justify-center h-[251px]">
            <Spinner className="animate-spin text-ui-fg-subtle" />
          </div>
        ) : (
          <>
            <DataTable.Table
              emptyState={{
                empty: {
                  heading: "No variants available",
                },
              }}
            />
          </>
        )}
      </DataTable>
    </div>
  );
};

export default VariantPricingForm;
