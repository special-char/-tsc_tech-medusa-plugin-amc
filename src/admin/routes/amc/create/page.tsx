import AmcDetail from "../../../components/AmcDetail";
import { useForm } from "react-hook-form";
import { sdk } from "../../../lib/sdk";
import { useNavigate } from "react-router-dom";
import { transformPrices } from "../../../lib/const";

const AmcCreate = () => {
  const form = useForm({
    defaultValues: {
      title: "",
      sku: "",
      barcode: "",
      variant_id: [],
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
    navigate("/amc");
  };
  return (
    <>
      <AmcDetail form={form} onSubmit={onSubmit} />
    </>
  );
};

export default AmcCreate;
