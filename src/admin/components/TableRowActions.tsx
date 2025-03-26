import { PencilSquare, Trash } from "@medusajs/icons";
import { useNavigate } from "react-router-dom";
import { IconButton, Prompt } from "@medusajs/ui";

type AmcRowActionsProps = {
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

export const AmcRowActions = ({ amc }: AmcRowActionsProps) => {
  const navigation = useNavigate();
  // const handleDelete = async () => {
  //   await sdk.client.fetch(
  //     `/admin/notification-template/${notificationTemplate.id}`,
  //     {
  //       method: "DELETE",
  //     }
  //   );

  //   navigation("/notification-template");
  //   navigation(0);
  // };

  return (
    <div className="flex">
      <IconButton
        onClick={() =>
          navigation(`/amc/edit`, {
            state: amc,
          })
        }
      >
        <PencilSquare />
      </IconButton>
    </div>
  );
};
