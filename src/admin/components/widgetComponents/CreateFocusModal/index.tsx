import { Button } from "@medusajs/ui";
import FocusModalComponent from "../FocusModalComponent";
import { sdk } from "../../../lib/sdk";
import { useForm } from "react-hook-form";
import { transformPrices } from "../../../lib/const";
import { useNavigate } from "react-router-dom";
import AmcDetail from "../../AmcDetail";

type Props = {
  variantId?: string;
  isVariant: boolean;
  productId?: string;
};

const CreateFocusModal = (props: Props) => {
  const form = useForm({
    defaultValues: {
      title: "",
      sku: "",
      barcode: "",
      duration: null,
      variant_id: props.isVariant ? [props.variantId] : [],
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
    await sdk.client.fetch("/admin/amc", {
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
        <Button variant="secondary" size="small">
          Create
        </Button>
      }
    >
      <AmcDetail productId={props.productId} form={form} onSubmit={onSubmit} />
    </FocusModalComponent>
  );
};

export default CreateFocusModal;
