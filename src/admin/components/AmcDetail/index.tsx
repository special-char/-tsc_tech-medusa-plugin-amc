import { Controller, UseFormReturn } from "react-hook-form";
import { RouteFocusModal } from "../common/modals";
import { KeyboundForm } from "../common/keybound-form";
import { useQuery } from "@tanstack/react-query";

import {
  Button,
  Checkbox,
  clx,
  Container,
  createDataTableColumnHelper,
  DataTable,
  DataTableRowSelectionState,
  Heading,
  Input,
  Label,
  ProgressStatus,
  ProgressTabs,
  useDataTable,
} from "@medusajs/ui";
import { useMemo, useState, useCallback } from "react";
import { Photo, Spinner } from "@medusajs/icons";
import ErrorMessage from "../ErrorMessage";
import { useVariantTableQuery } from "../../hooks/use-variant-table-query";
import { sdk } from "../../lib/sdk";
type Props = {
  form: UseFormReturn<any, any, undefined>;
  onSubmit: (data: any) => void;
};

export enum AmcCreateTab {
  AMC_DETAILS = "amc-details",
  AMC_PRODUCTS = "amc-products",
  AMC_PRICE = "amc-price",
}
const VARIANT_PAGE_SIZE = 9;
const VARIANT_PREFIX = "variant";
const columnHelper = createDataTableColumnHelper<any>();
const columns = (props: Props) => [
  columnHelper.select({
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllRowsSelected()
            ? true
            : table.getIsSomeRowsSelected()
            ? "indeterminate"
            : false
        }
        onCheckedChange={(value) => {
          table.toggleAllRowsSelected(!!value);
        }}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        onClick={(e) => {
          e.stopPropagation();
        }}
      />
    ),
    // header: ({ table }) => {
    //   const currentVariants = props.form.getValues("variants") || [];

    //   return (
    //     <Checkbox
    //       checked={
    //         Array.isArray(currentVariants) &&
    //         currentVariants.length === VARIANT_PAGE_SIZE
    //           ? true
    //           : Array.isArray(currentVariants) && currentVariants.length > 0
    //           ? "indeterminate"
    //           : false
    //       }
    //       onCheckedChange={(value) => {
    //         table.toggleAllRowsSelected(!!value);
    //         for (let index = 0; index < VARIANT_PAGE_SIZE; index++) {
    //           console.log(table.getRow(`${index}`));
    //           const currentRow = table.getRow(`${index}`);
    //           props.form.setValue("variants", [
    //             ...currentVariants,
    //             currentRow?.original?.id,
    //           ]);
    //         }
    //       }}
    //     />
    //   );
    // },
    // cell: ({ row }) => {
    //   const variants = props.form.watch("variants") || [];
    //   const isSelected = variants.some((v: any) => v === row.original.id);
    //   return (
    //     <>
    //       <Checkbox
    //         checked={isSelected}
    //         onClick={(e) => e.stopPropagation()}
    //         onCheckedChange={(checked) => {
    //           const currentVariants = props.form.getValues("variants") || [];
    //           if (checked) {
    //             // Add variant if checked
    //             props.form.setValue("variants", [
    //               ...currentVariants,
    //               row.original.id,
    //             ]);
    //           } else {
    //             // Remove variant if unchecked
    //             props.form.setValue(
    //               "variants",
    //               currentVariants.filter((v: any) => v !== row.original.id)
    //             );
    //           }
    //           // row.toggleSelected(!!checked);
    //         }}
    //       />
    //     </>
    //   );
    // },
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

type TabState = Record<AmcCreateTab, ProgressStatus>;
const AmcDetail = (props: Props) => {
  const [pageIndex, setPageIndex] = useState(0);

  const { searchParams: variantSearchParams } = useVariantTableQuery({
    pageSize: VARIANT_PAGE_SIZE,
    prefix: VARIANT_PREFIX,
  });

  const [searchValue, setSearchValue] = useState("");
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
          offset: pageIndex * VARIANT_PAGE_SIZE,
          limit: VARIANT_PAGE_SIZE,
          q: searchValue || undefined,
        },
      }),
    queryKey: ["product-variants", searchValue, pageIndex],
    staleTime: 30000,
  });

  const [tab, setTab] = useState<AmcCreateTab>(AmcCreateTab.AMC_DETAILS);

  const [tabState, setTabState] = useState<TabState>({
    [AmcCreateTab.AMC_DETAILS]: "in-progress",
    [AmcCreateTab.AMC_PRODUCTS]: "not-started",
    [AmcCreateTab.AMC_PRICE]: "not-started",
  });

  const handleTabChange = async (tab: AmcCreateTab) => {
    // Don't do anything if trying to navigate to current tab
    if (tab === AmcCreateTab.AMC_DETAILS) {
      setTab(tab);
      setTabState((prev) => ({
        ...prev,
        [AmcCreateTab.AMC_DETAILS]: "in-progress",
        [AmcCreateTab.AMC_PRODUCTS]: "not-started",
        [AmcCreateTab.AMC_PRICE]: "not-started",
      }));
      return;
    }

    // For other tabs, validate required fields
    if (tab === AmcCreateTab.AMC_PRODUCTS) {
      const valid = await props.form.trigger(["title", "sku", "barcode"]);
      if (!valid) {
        return;
      }

      setTab(tab);
      setTabState((prev) => ({
        ...prev,
        [AmcCreateTab.AMC_DETAILS]: "completed",
        [AmcCreateTab.AMC_PRODUCTS]: "in-progress",
        [AmcCreateTab.AMC_PRICE]: "not-started",
      }));
      return;
    }

    if (tab === AmcCreateTab.AMC_PRICE) {
      const variant = props.form.watch("variants");

      const valid = await props.form.trigger([
        "title",
        "sku",
        "barcode",
        "variants",
      ]);
      // &&
      // Array.isArray(variant) &&
      // variant.length > 0;

      if (!valid) {
        return;
      }

      setTab(tab);
      setTabState((prev) => ({
        ...prev,
        [AmcCreateTab.AMC_DETAILS]: "completed",
        [AmcCreateTab.AMC_PRODUCTS]: "completed",
        [AmcCreateTab.AMC_PRICE]: "in-progress",
      }));
      return;
    }
  };

  const handleContinue = async () => {
    switch (tab) {
      case AmcCreateTab.AMC_DETAILS: {
        // Validate region before continuing
        const valid = await props.form.trigger(["title", "sku", "barcode"]);
        if (valid) {
          handleTabChange(AmcCreateTab.AMC_PRODUCTS);
        }
        break;
      }
      case AmcCreateTab.AMC_PRODUCTS: {
        const variant = props.form.watch("variants");
        const valid = await props.form.trigger([
          "title",
          "sku",
          "barcode",
          "variants",
        ]);
        // &&
        // Array.isArray(variant) &&
        // variant.length > 0;

        if (valid) {
          handleTabChange(AmcCreateTab.AMC_PRICE);
        }
        break;
      }
      case AmcCreateTab.AMC_PRICE:
        await props.form.handleSubmit(props.onSubmit)();
        break;
    }
  };
  const variantData = useMemo(() => {
    return variants?.variants ?? [];
  }, [variants?.variants]);

  const [variantSelection, setVariantSelection] =
    useState<DataTableRowSelectionState>({});
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

      onRowSelectionChange: useCallback(
        (state) => {
          setVariantSelection(state);
        },
        [variantSelection]
      ),
    },
  });

  return (
    <RouteFocusModal>
      <KeyboundForm
        hidden={true}
        className="flex h-full flex-col"
        onSubmit={props.form.handleSubmit(props.onSubmit)}
      >
        <ProgressTabs
          value={tab}
          onValueChange={(v) => handleTabChange(v as AmcCreateTab)}
          className="flex h-full flex-col overflow-hidden"
        >
          <RouteFocusModal.Header>
            <div className="flex w-full items-center justify-between gap-x-4">
              <div className="-my-2 w-full max-w-[600px] border-l">
                <ProgressTabs.List className="grid w-full grid-cols-4">
                  <ProgressTabs.Trigger
                    className="w-full"
                    value={AmcCreateTab.AMC_DETAILS}
                    status={tabState[AmcCreateTab.AMC_DETAILS]}
                  >
                    AMC Details
                  </ProgressTabs.Trigger>

                  <ProgressTabs.Trigger
                    className="w-full"
                    value={AmcCreateTab.AMC_PRODUCTS}
                    status={tabState[AmcCreateTab.AMC_PRODUCTS]}
                  >
                    AMC Products
                  </ProgressTabs.Trigger>
                  <ProgressTabs.Trigger
                    className="w-full"
                    value={AmcCreateTab.AMC_PRICE}
                    status={tabState[AmcCreateTab.AMC_PRICE]}
                  >
                    AMC Price
                  </ProgressTabs.Trigger>
                </ProgressTabs.List>
              </div>
            </div>
          </RouteFocusModal.Header>
          <RouteFocusModal.Body className="size-full overflow-hidden">
            <ProgressTabs.Content
              value={AmcCreateTab.AMC_DETAILS}
              className="flex flex-col items-center overflow-y-auto"
            >
              <div className="flex size-full max-w-3xl flex-col gap-4 p-16">
                <Controller
                  control={props.form.control}
                  name="title"
                  rules={{ required: "Title is required" }}
                  render={({ field }) => {
                    return (
                      <div>
                        <Label>Title</Label>
                        <Input className="m-0 gap-0" {...field} />
                        <ErrorMessage form={props.form} field={field.name} />
                      </div>
                    );
                  }}
                />
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Controller
                    control={props.form.control}
                    name="sku"
                    rules={{ required: "SKU is required" }}
                    render={({ field }) => {
                      return (
                        <div>
                          <Label>SKU</Label>
                          <Input autoComplete="off" {...field} />
                          <ErrorMessage form={props.form} field={field.name} />
                        </div>
                      );
                    }}
                  />
                  <Controller
                    control={props.form.control}
                    name="barcode"
                    rules={{ required: "Barcode is required" }}
                    render={({ field }) => {
                      return (
                        <div>
                          <Label>Barcode</Label>
                          <Input autoComplete="off" {...field} />
                          <ErrorMessage form={props.form} field={field.name} />
                        </div>
                      );
                    }}
                  />
                </div>
              </div>
            </ProgressTabs.Content>

            <ProgressTabs.Content value={AmcCreateTab.AMC_PRODUCTS}>
              <Container>
                <Controller
                  control={props.form.control}
                  name="variants"
                  rules={{ required: "One variant must be selected" }}
                  render={({ field }) => {
                    return (
                      <div>
                        <input
                          type="hidden"
                          {...field}
                          value={JSON.stringify(field.value)}
                        />
                        <DataTable instance={table}>
                          <DataTable.Toolbar className="flex justify-between items-center">
                            <Heading>Products</Heading>
                            <DataTable.Search
                              autoFocus={true}
                              placeholder="Search Variants"
                            />
                            <Button
                              size="small"
                              variant="secondary"
                              asChild
                            ></Button>
                          </DataTable.Toolbar>
                          {isLoading ? (
                            <div className="flex items-center justify-center h-[251px]">
                              <Spinner className="animate-spin text-ui-fg-subtle" />
                            </div>
                          ) : variantData.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-[251px] gap-y-2">
                              <span className="text-ui-fg-subtle">
                                No results found
                              </span>
                              {searchValue && (
                                <span className="text-ui-fg-subtle text-sm">
                                  Try adjusting your search query
                                </span>
                              )}
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
                              <DataTable.Pagination />
                            </>
                          )}
                        </DataTable>
                      </div>
                    );
                  }}
                />
              </Container>
            </ProgressTabs.Content>

            <ProgressTabs.Content value={AmcCreateTab.AMC_PRICE}>
              {AmcCreateTab.AMC_PRICE}
            </ProgressTabs.Content>
          </RouteFocusModal.Body>
        </ProgressTabs>
        <RouteFocusModal.Footer>
          <div className="flex items-center justify-end gap-x-2">
            <RouteFocusModal.Close asChild>
              <Button variant="secondary" size="small">
                Cancel
              </Button>
            </RouteFocusModal.Close>

            <Button
              key="continue-btn"
              type="button"
              onClick={handleContinue}
              size="small"
            >
              {tab === AmcCreateTab.AMC_PRICE ? (
                props.form.formState.isSubmitting ? (
                  <Spinner className="animate-spin" />
                ) : (
                  "Create Order"
                )
              ) : (
                "Continue"
              )}
            </Button>
          </div>
        </RouteFocusModal.Footer>
      </KeyboundForm>
    </RouteFocusModal>
  );
};

export default AmcDetail;
