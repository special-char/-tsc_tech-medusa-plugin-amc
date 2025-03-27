import AmcDetail from "../../../components/AmcDetail";
import { useForm } from "react-hook-form";
import { sdk } from "../../../lib/sdk";
import { useNavigate } from "react-router-dom";

const AmcCreate = () => {
  const form = useForm({
    defaultValues: {
      title: "",
      sku: "",
      barcode: "",
      variant_id: [],
      prices: [],
    },
    mode: "onChange",
    reValidateMode: "onChange",
    shouldUnregister: false,
  });
  const navigate = useNavigate();
  const onSubmit = async (data: any) => {
    console.log("🚀 ~ onSubmit ~ data:", data);
    const response = await sdk.client.fetch("/admin/amc", {
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

export default AmcCreate;
