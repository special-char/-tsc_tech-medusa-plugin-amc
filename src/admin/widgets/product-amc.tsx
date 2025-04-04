import { defineWidgetConfig } from "@medusajs/admin-sdk";
import { AmcListTable } from "../components/DataTable";
import { DetailWidgetProps } from "@medusajs/framework/types";
import EditFocusModal from "../components/widgetComponents/EditFocusModal";
import CreateFocusModal from "../components/widgetComponents/CreateFocusModal";

const ProductAMCWidget = (props: DetailWidgetProps<any>) => {
  return (
    <AmcListTable
      productId={props.data.id}
      createBtn={() => {
        return <CreateFocusModal productId={props.data.id} isVariant={false} />;
      }}
      editBtn={({ state }) => {
        return (
          <EditFocusModal
            productId={props.data.id}
            state={state}
            isVariant={false}
          />
        );
      }}
    />
  );
};
export const config = defineWidgetConfig({
  zone: "product.details.after",
});

export default ProductAMCWidget;
