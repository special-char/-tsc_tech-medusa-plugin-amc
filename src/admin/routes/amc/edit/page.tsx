import AmcDetail from "../../../components/AmcDetail";
import { useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
type Props = {};

const AmcEdit = (props: Props) => {
  const { state } = useLocation();
  const form = useForm({
    defaultValues: {
      ...state,
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

export default AmcEdit;
