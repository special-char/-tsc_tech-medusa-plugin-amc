import {
  Button,
  Container,
  DataTable,
  Heading,
  createDataTableColumnHelper,
  useDataTable,
} from "@medusajs/ui";
import { Link } from "react-router-dom";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { AmcProps, AmcRowActions } from "../../components/TableRowActions";
import { sdk } from "../../lib/sdk";
// import { sdk } from "../../lib/client";

const columnHelper = createDataTableColumnHelper();

const columns = [
  columnHelper.accessor("title", {
    header: "Title",
  }),
  columnHelper.accessor("sku", {
    header: "SKU",
    maxSize: 200,
  }),
  columnHelper.accessor("barcode", {
    header: "Barcode",
  }),
  columnHelper.accessor("created_at", {
    header: "Created At",
  }),
  columnHelper.accessor("updated_at", {
    header: "Updated At",
  }),
  columnHelper.accessor("actions", {
    header: "Actions",
    cell: ({ row }) => {
      return (
        <div className="mx-4">
          <AmcRowActions amc={row.original as AmcProps} />
        </div>
      );
    },
  }),
];

export function AmcListTable({}) {
  const { data, isLoading } = useQuery({
    queryFn: () =>
      sdk.client.fetch(`/admin/amc`, {
        method: "GET",
      }),
    queryKey: ["amc"],
    refetchOnMount: "always",
  });
  // Log the fetched data to verify its structure
  const amcData = useMemo(() => {
    return ((data as any)?.data as any[]) || [];
  }, [(data as any)?.data]);

  const table = useDataTable({
    data: amcData,
    columns: columns as unknown as any,
    rowCount: amcData?.length,
    isLoading,
    pagination: {
      onPaginationChange: () => {},
      state: {
        pageIndex: 0,
        pageSize: 50,
      },
    },
  });

  return (
    <Container className="p-0">
      <DataTable instance={table}>
        <DataTable.Toolbar className="flex justify-between items-center">
          <Heading>AMC</Heading>
          <Button size="small" variant="secondary" asChild>
            <Link to="create">Create</Link>
          </Button>
        </DataTable.Toolbar>
        <DataTable.Table />
        <DataTable.Pagination />
      </DataTable>
    </Container>
  );
}
