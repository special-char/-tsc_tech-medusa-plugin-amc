import { BuildingStorefront } from "@medusajs/icons";
import { defineRouteConfig } from "@medusajs/admin-sdk";
import { DataTableComponent } from "../../components/DataTable";

const AmcList = () => {
  return (
    <div>
      <DataTableComponent />
    </div>
  );
};

export const config = defineRouteConfig({
  icon: BuildingStorefront,
  label: "AMC",
});

export default AmcList;
