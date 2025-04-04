import { FocusModal } from "@medusajs/ui";

type Props = {
  trigger: React.ReactNode;
  children: React.ReactNode;
};

const FocusModalComponent = ({ trigger, children }: Props) => {
  return (
    <FocusModal>
      <FocusModal.Trigger asChild>{trigger}</FocusModal.Trigger>
      <FocusModal.Content>
        <FocusModal.Header />
        <FocusModal.Body className="flex">{children}</FocusModal.Body>
      </FocusModal.Content>
    </FocusModal>
  );
};

export default FocusModalComponent;
