import AmcDetail from "../../../components/AmcDetail";
import { useForm } from "react-hook-form";

const AmcCreate = () => {
  const form = useForm({
    defaultValues: {
      title: "",
      sku: "",
      barcode: "",
    },
    mode: "onChange",
    reValidateMode: "onChange",
    shouldUnregister: false,
  });
  const onSubmit = (data: any) => {
    console.log("🚀 ~ onSubmit ~ data:", data);
  };
  return (
    <>
      <AmcDetail form={form} onSubmit={onSubmit} />
    </>
  );
};

export default AmcCreate;
