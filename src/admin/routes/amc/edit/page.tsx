import AmcDetail from "../../../components/AmcDetail";
import { useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { sdk } from "../../../lib/sdk";
type Props = {};

const AmcEdit = (props: Props) => {
  const { state } = useLocation();
  // console.log("🚀 ~ state:", state);

  const form = useForm({
    defaultValues: {
      title: state.title,
      sku: state.sku,
      barcode: state.barcode,
      prices: [],
      variant_id: state.product_variants.map((v: any) => v.id),
    },
    mode: "onChange",
    reValidateMode: "onChange",
    shouldUnregister: false,
  });
  const navigate = useNavigate();
  const onSubmit = async (data: any) => {
    console.log("🚀 ~ onSubmit ~ data:", data);
    const response = await sdk.client.fetch(`/admin/amc/${state.id}`, {
      body: data,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    navigate("/amc");
    // navigate(0);
    console.log("🚀 ~ onSubmit ~ response:", response);
  };
  return (
    <>
      <AmcDetail form={form} onSubmit={onSubmit} />
    </>
  );
};

export default AmcEdit;
