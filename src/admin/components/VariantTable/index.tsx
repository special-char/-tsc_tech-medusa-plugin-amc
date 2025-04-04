import { Spinner } from "@medusajs/icons";
import { Controller, UseFormReturn } from "react-hook-form";
import {
  Button,
  Checkbox,
  CheckboxCheckedState,
  createDataTableColumnHelper,
  DataTableRowSelectionState,
  useDataTable,
} from "@medusajs/ui";
import { Heading } from "@medusajs/ui";
import { DataTable } from "@medusajs/ui";
import { useMemo, useState, useCallback } from "react";
import { sdk } from "../../lib/sdk";
import { useQuery } from "@tanstack/react-query";
import { clx } from "@medusajs/ui";
import { Photo } from "@medusajs/icons";
import ErrorMessage from "../ErrorMessage";

type Props = {
  form: UseFormReturn<any, any, undefined>;
  productId?: string;
};

const VARIANT_PAGE_SIZE = 10;
const columnHelper = createDataTableColumnHelper<any>();
const columns = (props: Props) => [
  columnHelper.select({
    header: ({ table }) => {
      const currentVariants = props.form.getValues("variant_id") || [];
      return (
        <Controller
          control={props.form.control}
          name="variant_id"
          render={({ field }) => {
            // Get the actual rows on the current page
            const currentPageRows = table.getRowModel().rows;
            // Get all visible variant IDs from current page using actual rows
            const visibleVariantIds = currentPageRows
              .map((row) => row.original?.id)
              .filter(Boolean);

            // Check if all visible variants are selected
            const allVisibleSelected = visibleVariantIds.every((id) =>
              currentVariants.includes(id)
            );
            // Check if some (but not all) visible variants are selected
            const someVisibleSelected = visibleVariantIds.some((id) =>
              currentVariants.includes(id)
            );

            // Determine checkbox state
            let checkboxState: CheckboxCheckedState = false;
            if (allVisibleSelected && visibleVariantIds.length > 0) {
              checkboxState = true;
            } else if (someVisibleSelected) {
              checkboxState = "indeterminate";
            }

            return (
              <Checkbox
                checked={checkboxState}
                onCheckedChange={(value) => {
                  if (value) {
                    // If checking, add all visible variants
                    const uniqueVariants = [
                      ...new Set([...currentVariants, ...visibleVariantIds]),
                    ];
                    field.onChange(uniqueVariants);
                  } else {
                    // If unchecking, remove all visible variants
                    const remainingVariants = currentVariants.filter(
                      (id: string) => !visibleVariantIds.includes(id)
                    );
                    field.onChange(remainingVariants);
                  }
                }}
              />
            );
          }}
        />
      );
    },
    cell: ({ row }) => {
      const variants = props.form.watch("variant_id") || [];
      const isSelected = variants.some((v: any) => v === row.original.id);
      return (
        <Controller
          control={props.form.control}
          name="variant_id"
          render={({ field }) => (
            <Checkbox
              checked={isSelected}
              onClick={(e) => e.stopPropagation()}
              onCheckedChange={useCallback((checked: CheckboxCheckedState) => {
                const currentVariants =
                  props.form.getValues("variant_id") || [];
                if (checked) {
                  // Update form state first
                  field.onChange([...currentVariants, row.original.id]);
                  // Then update row selection
                  // row.toggleSelected(true);
                } else {
                  // Update form state first
                  field.onChange(
                    currentVariants.filter((v: any) => v !== row.original.id)
                  );
                  // Then update row selection
                  // row.toggleSelected(false);
                }
              }, [])}
            />
          )}
        />
      );
    },
  }),
  columnHelper.accessor("title", {
    header: () => <span>Variant</span>,
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <div
          className={clx(
            "bg-ui-bg-component border-ui-border-base flex items-center justify-center overflow-hidden rounded border h-8 w-6"
          )}
        >
          {row.original?.product?.thumbnail ? (
            <img
              src={row.original?.product?.thumbnail}
              alt={row.original?.product?.title}
              className="h-full w-full object-cover object-center"
            />
          ) : (
            <Photo className="text-ui-fg-subtle" />
          )}
        </div>
        <div className="text-sm text-gray-500">{row?.original?.title}</div>
      </div>
    ),
  }),
  columnHelper.accessor("id", {
    header: () => <span>Product</span>,
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <span title={row.original?.product?.title} className="truncate">
          {row.original?.product?.title}
        </span>
      </div>
    ),
  }),
];

const VariantTable = (props: Props) => {
  const [pageIndex, setPageIndex] = useState(0);
  const endpoint = props.productId
    ? `/admin/products/${props.productId}/variants`
    : "/admin/product-variants";
  const fields = props.productId ? "*product" : undefined;
  const [searchValue, setSearchValue] = useState("");
  const { data: variants, isLoading } = useQuery<{
    variants: [];
    count: number;
    limit: number;
    offset: number;
  }>({
    queryFn: () =>
      sdk.client.fetch(endpoint, {
        headers: {},
        query: {
          fields,
          offset: pageIndex * VARIANT_PAGE_SIZE,
          limit: VARIANT_PAGE_SIZE,
          q: searchValue || undefined,
        },
      }),
    queryKey: ["product-variants", searchValue, pageIndex, endpoint],
    staleTime: 30000,
  });

  const [variantSelection, setVariantSelection] =
    useState<DataTableRowSelectionState>({});
  const variantData = useMemo(() => {
    return variants?.variants ?? [];
  }, [variants?.variants]);
  const table = useDataTable({
    columns: useMemo(() => columns(props) as unknown as any, []),
    data: variantData,
    isLoading,
    rowCount: variants?.count ?? 0,
    pagination: {
      onPaginationChange: useCallback(({ pageIndex: newPageIndex }) => {
        setPageIndex(newPageIndex);
      }, []),
      state: {
        pageIndex,
        pageSize: VARIANT_PAGE_SIZE,
      },
    },
    sorting: {
      state: null,
      onSortingChange: () => {},
    },
    search: {
      debounce: 1000,
      state: searchValue,
      onSearchChange: useCallback((value: string) => {
        setSearchValue(value);
        setPageIndex(0);
      }, []),
    },
    rowSelection: {
      state: useMemo(() => {
        return variantSelection;
      }, [variantSelection]),

      onRowSelectionChange: useCallback((state) => {
        setVariantSelection(state);
      }, []),
    },
  });

  return (
    <div>
      <DataTable instance={table}>
        <DataTable.Toolbar className="flex justify-between items-center">
          <Heading>Products</Heading>
          <DataTable.Search autoFocus={true} placeholder="Search Variants" />
          <Button size="small" variant="secondary" asChild></Button>
        </DataTable.Toolbar>
        {isLoading ? (
          <div className="flex items-center justify-center h-[251px]">
            <Spinner className="animate-spin text-ui-fg-subtle" />
          </div>
        ) : variantData.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[251px] gap-y-2">
            <span className="text-ui-fg-subtle">No results found</span>
            {searchValue && (
              <span className="text-ui-fg-subtle text-sm">
                Try adjusting your search query
              </span>
            )}
          </div>
        ) : (
          <>
            <ErrorMessage
              className="mx-4"
              form={props.form}
              field="variant_id"
            />
            <DataTable.Table
              emptyState={{
                empty: {
                  heading: "No variants available",
                },
              }}
            />
            <DataTable.Pagination />
          </>
        )}
      </DataTable>
    </div>
  );
};

export default VariantTable;
