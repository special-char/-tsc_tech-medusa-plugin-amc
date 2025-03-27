import { BuildingStorefront } from "@medusajs/icons";
import { defineRouteConfig } from "@medusajs/admin-sdk";
import { AmcListTable } from "../../components/DataTable";

const AmcList = () => {
  return (
    <div>
      <AmcListTable />
    </div>
  );
};

export const config = defineRouteConfig({
  icon: BuildingStorefront,
  label: "AMC",
});

export default AmcList;
