import { IconButton } from "@medusajs/ui";
import FocusModalComponent from "../FocusModalComponent";
import { PencilSquare } from "@medusajs/icons";
import { transformPrices } from "../../../lib/const";
import { useForm } from "react-hook-form";
import { reverseTransformPrices } from "../../../lib/const";
import { sdk } from "../../../lib/sdk";
import { useNavigate } from "react-router-dom";
import AmcDetail from "../../AmcDetail";

type Props = {
  state: any;
  isVariant: boolean;
  productId?: string;
};

const EditFocusModal = ({ state, productId }: Props) => {
  const form = useForm({
    defaultValues: {
      title: state.title,
      sku: state.sku,
      barcode: state.barcode,
      prices: reverseTransformPrices(state?.price_set?.prices ?? []),
      duration: state.duration,
      variant_id: state.product_variants.map((v: any) => v.id),
    },
    mode: "onChange",
    reValidateMode: "onChange",
    shouldUnregister: false,
  });
  const navigate = useNavigate();
  const onSubmit = async (data: any) => {
    const reqData = {
      ...data,
      prices: await transformPrices(data.prices ?? []),
    };
    await sdk.client.fetch(`/admin/amc/${state.id}`, {
      body: reqData,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    navigate(0);
  };
  return (
    <FocusModalComponent
      trigger={
        <IconButton>
          <PencilSquare />
        </IconButton>
      }
    >
      <AmcDetail
        form={form}
        amcId={state.id}
        productId={productId}
        onSubmit={onSubmit}
      />
    </FocusModalComponent>
  );
};

export default EditFocusModal;
