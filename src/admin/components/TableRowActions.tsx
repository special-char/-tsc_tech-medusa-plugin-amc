import { PencilSquare } from "@medusajs/icons";
import { useNavigate } from "react-router-dom";
import { IconButton } from "@medusajs/ui";

type AmcRowActionsProps = {
  editBtn?: ({ state }: { state: any }) => React.ReactNode;
  amc: AmcProps;
};
export type Event = {
  id?: string;
  name?: string;
  tags?: Record<string, any>;
};

// Define a type for the brand data
export interface AmcProps {
  id?: string;

  template?: string;

  created_at?: string;

  updated_at?: string;

  deleted_at?: string | null;

  event_name: string;
}

export const AmcRowActions = ({
  amc,
  editBtn: EditBtn,
}: AmcRowActionsProps) => {
  const navigation = useNavigate();
  return (
    <div className="flex">
      {EditBtn ? (
        <EditBtn state={amc} />
      ) : (
        <IconButton
          onClick={() =>
            navigation(`/amc/edit`, {
              state: amc,
            })
          }
        >
          <PencilSquare />
        </IconButton>
      )}
    </div>
  );
};
