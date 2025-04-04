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
import { format } from "date-fns";

const columnHelper = createDataTableColumnHelper();

const columns = (editBtn?: ({ state }: { state: any }) => React.ReactNode) => [
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
    cell: ({ row }) => {
      return <div>{format(row.original?.created_at, "dd/MM/yyyy")}</div>;
    },
  }),
  columnHelper.accessor("updated_at", {
    header: "Updated At",
    cell: ({ row }) => {
      return <div>{format(row.original?.updated_at, "dd/MM/yyyy")}</div>;
    },
  }),
  columnHelper.accessor("actions", {
    header: "Actions",
    cell: ({ row }) => {
      return (
        <div className="mx-4">
          <AmcRowActions editBtn={editBtn} amc={row.original as AmcProps} />
        </div>
      );
    },
  }),
];

export function AmcListTable({
  createBtn: CreateBtn,
  productId,
  editBtn,
}: {
  productId?: string;
  createBtn?: () => React.ReactNode;
  editBtn?: ({ state }: { state: any }) => React.ReactNode;
}) {
  const { data, isLoading } = useQuery({
    queryFn: () =>
      sdk.client.fetch(`/admin/amc`, {
        method: "GET",
        query: {
          product_id: productId,
        },
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
    columns: columns(editBtn),
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
          {CreateBtn ? (
            <CreateBtn />
          ) : (
            <Button size="small" variant="secondary" asChild>
              <Link to="create">Create</Link>
            </Button>
          )}
        </DataTable.Toolbar>
        <DataTable.Table
          emptyState={{
            empty: {
              heading: "No AMC available",
              description: "No AMC found for this product",
            },
          }}
        />
        <DataTable.Pagination />
      </DataTable>
    </Container>
  );
}
