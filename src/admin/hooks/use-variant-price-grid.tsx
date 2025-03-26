import { HttpTypes } from "@medusajs/framework/types";
import { FieldPath, FieldValues, UseFormReturn } from "react-hook-form";
import {
  CellContext,
  ColumnDefTemplate,
  createColumnHelper,
  HeaderContext,
} from "@tanstack/react-table";
import { Button, createDataTableColumnHelper, Input } from "@medusajs/ui";
import { DataGridColumnType, FieldFunction } from "../types/data-grid-types";
import { BuildingTax } from "@medusajs/icons";
import { useMemo } from "react";

type DataGridHelperColumnsProps<TData, TFieldValues extends FieldValues> = {
  /**
   * The id of the column.
   */
  id: string;
  /**
   * The name of the column, shown in the column visibility menu.
   */
  name?: string;
  /**
   * The header template for the column.
   */
  header: ColumnDefTemplate<HeaderContext<TData, unknown>> | undefined;
  /**
   * The cell template for the column.
   */
  cell: ColumnDefTemplate<CellContext<TData, unknown>> | undefined;
  /**
   * Callback to set the field path for each cell in the column.
   * If a callback is not provided, or returns null, the cell will not be editable.
   */
  field?: FieldFunction<TData, TFieldValues>;
  /**
   * Whether the column cannot be hidden by the user.
   *
   * @default false
   */
  disableHiding?: boolean;
} & (
  | {
      field: FieldFunction<TData, TFieldValues>;
      type: DataGridColumnType;
    }
  | { field?: null | undefined; type?: never }
);

export function createDataGridHelper<TData, TFieldValues>() {
  const columnHelper = createColumnHelper<TData>();

  return {
    column: ({
      id,
      name,
      header,
      cell,
      disableHiding = false,
      field,
      type,
    }: DataGridHelperColumnsProps<TData, any>) =>
      columnHelper.display({
        id,
        header,
        cell,
        enableHiding: !disableHiding,
        meta: {
          name,
          field,
          type,
        },
      }),
  };
}

const columnHelper = createDataGridHelper();

export const useVariantPriceGridColumns = ({
  currencies = [],
  regions = [],
  form,
}: {
  currencies?: HttpTypes.AdminStore["supported_currencies"];
  regions?: HttpTypes.AdminRegion[];
  form: UseFormReturn<any, any, undefined>;
}) => {
  return useMemo(() => {
    return [
      columnHelper.column({
        id: "title",
        header: "Title",
        cell: (context) => {
          const entity = context.row.original;
          return (
            <div className="flex h-full w-full items-center gap-x-2 overflow-hidden">
              <span className="truncate">{entity?.title}</span>
            </div>
          );
        },
        disableHiding: true,
      }),
      ...currencies.map((currency) => {
        return columnHelper.column({
          id: currency.toString(),
          header: () => {
            return (
              <div className="flex p-2 gap-4 w-full">
                <span>Price ({currency.toString()})</span>

                <BuildingTax className="w-4 h-4" />
              </div>
            );
          },
          cell: (context) => {
            const formatter = new Intl.NumberFormat(undefined, {
              style: "currency",
              currency: currency.toString(),
            });

            return (
              <div className="flex items-center gap-x-2 p-2 w-full">
                <Input
                  {...form.register(`prices.${currency}`)}
                  className="w-full"
                />
                <span className="text-ui-fg-subtle text-sm">
                  {formatter
                    .formatToParts(0)
                    .map((p) => (p.type === "currency" ? p.value : ""))
                    .join("")}
                </span>
              </div>
            );
          },
        });
      }),
      ...regions.map((region) => {
        return columnHelper.column({
          id: region.id,
          header: () => {
            return (
              <div className="flex gap-4 p-2 w-full">
                <span>{region.name}</span>
                <BuildingTax className="w-4 h-4" />
              </div>
            );
          },
          cell: (context) => {
            const formatter = new Intl.NumberFormat(undefined, {
              style: "currency",
              currency: region.currency_code,
            });

            return (
              <div className="flex items-center gap-x-2 p-2 w-full">
                <Input
                  {...form.register(`prices.${region.id}`)}
                  className="w-full"
                />
                <span className="text-ui-fg-subtle text-sm">
                  {formatter
                    .formatToParts(0)
                    .map((p) => (p.type === "currency" ? p.value : ""))
                    .join("")}
                </span>
              </div>
            );
          },
        });
      }),
    ];
  }, [currencies, regions]);
};
