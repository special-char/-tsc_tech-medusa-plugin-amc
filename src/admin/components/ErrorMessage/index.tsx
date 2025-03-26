import { UseFormReturn } from "react-hook-form";
type Props = {
  form: UseFormReturn<any, any, undefined>;
  field: string;
};

const ErrorMessage = (props: Props) => {
  return (
    <>
      {props.form.formState.errors[props.field] && (
        <p className="text-red-500 text-sm">
          {props.form.formState.errors[props.field]?.message?.toString()}
        </p>
      )}
    </>
  );
};

export default ErrorMessage;
