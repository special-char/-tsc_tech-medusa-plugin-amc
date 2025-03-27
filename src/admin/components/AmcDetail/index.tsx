import { Controller, UseFormReturn } from "react-hook-form";
import { RouteFocusModal } from "../common/modals";
import { KeyboundForm } from "../common/keybound-form";

import {
  Button,
  Container,
  Input,
  Label,
  ProgressStatus,
  ProgressTabs,
} from "@medusajs/ui";
import { useState } from "react";
import { Spinner } from "@medusajs/icons";
import ErrorMessage from "../ErrorMessage";
import VariantPricingForm from "../VariantPricingForm";
import VariantTable from "../VariantTable";
type Props = {
  form: UseFormReturn<any, any, undefined>;
  onSubmit: (data: any) => void;
};

export enum AmcCreateTab {
  AMC_DETAILS = "amc-details",
  AMC_PRODUCTS = "amc-products",
  AMC_PRICE = "amc-price",
}

type TabState = Record<AmcCreateTab, ProgressStatus>;
const AmcDetail = (props: Props) => {
  const [tab, setTab] = useState<AmcCreateTab>(AmcCreateTab.AMC_DETAILS);

  const [tabState, setTabState] = useState<TabState>({
    [AmcCreateTab.AMC_DETAILS]: "in-progress",
    [AmcCreateTab.AMC_PRODUCTS]: "not-started",
    [AmcCreateTab.AMC_PRICE]: "not-started",
  });

  const handleTabChange = async (tab: AmcCreateTab) => {
    // Don't do anything if trying to navigate to current tab
    if (tab === AmcCreateTab.AMC_DETAILS) {
      setTab(tab);
      setTabState((prev) => ({
        ...prev,
        [AmcCreateTab.AMC_DETAILS]: "in-progress",
        [AmcCreateTab.AMC_PRODUCTS]: "not-started",
        [AmcCreateTab.AMC_PRICE]: "not-started",
      }));
      return;
    }

    // For other tabs, validate required fields
    if (tab === AmcCreateTab.AMC_PRODUCTS) {
      const valid = await props.form.trigger(["title", "sku", "barcode"]);
      if (!valid) {
        return;
      }

      setTab(tab);
      setTabState((prev) => ({
        ...prev,
        [AmcCreateTab.AMC_DETAILS]: "completed",
        [AmcCreateTab.AMC_PRODUCTS]: "in-progress",
        [AmcCreateTab.AMC_PRICE]: "not-started",
      }));
      return;
    }

    if (tab === AmcCreateTab.AMC_PRICE) {
      const variant = props.form.watch("variants");

      const valid = await props.form.trigger([
        "title",
        "sku",
        "barcode",
        // "variants",
      ]);
      // &&
      // Array.isArray(variant) &&
      // variant.length > 0;

      if (!valid) {
        return;
      }

      setTab(tab);
      setTabState((prev) => ({
        ...prev,
        [AmcCreateTab.AMC_DETAILS]: "completed",
        [AmcCreateTab.AMC_PRODUCTS]: "completed",
        [AmcCreateTab.AMC_PRICE]: "in-progress",
      }));
      return;
    }
  };

  const handleContinue = async () => {
    switch (tab) {
      case AmcCreateTab.AMC_DETAILS: {
        // Validate region before continuing
        const valid = await props.form.trigger(["title", "sku", "barcode"]);
        if (valid) {
          handleTabChange(AmcCreateTab.AMC_PRODUCTS);
        }
        break;
      }
      case AmcCreateTab.AMC_PRODUCTS: {
        const variant = props.form.watch("variants");
        const valid = await props.form.trigger([
          "title",
          "sku",
          "barcode",
          // "variants",
        ]);
        // &&
        // Array.isArray(variant) &&
        // variant.length > 0;

        if (valid) {
          handleTabChange(AmcCreateTab.AMC_PRICE);
        }
        break;
      }
      case AmcCreateTab.AMC_PRICE:
        await props.form.handleSubmit(props.onSubmit)();
        break;
    }
  };

  return (
    <RouteFocusModal>
      <KeyboundForm
        hidden={true}
        className="flex h-full flex-col"
        onSubmit={props.form.handleSubmit(props.onSubmit)}
      >
        <ProgressTabs
          value={tab}
          onValueChange={(v) => handleTabChange(v as AmcCreateTab)}
          className="flex h-full flex-col overflow-hidden"
        >
          <RouteFocusModal.Header>
            <div className="flex w-full items-center justify-between gap-x-4">
              <div className="-my-2 w-full max-w-[600px] border-l">
                <ProgressTabs.List className="grid w-full grid-cols-4">
                  <ProgressTabs.Trigger
                    className="w-full"
                    value={AmcCreateTab.AMC_DETAILS}
                    status={tabState[AmcCreateTab.AMC_DETAILS]}
                  >
                    AMC Details
                  </ProgressTabs.Trigger>

                  <ProgressTabs.Trigger
                    className="w-full"
                    value={AmcCreateTab.AMC_PRODUCTS}
                    status={tabState[AmcCreateTab.AMC_PRODUCTS]}
                  >
                    AMC Products
                  </ProgressTabs.Trigger>
                  <ProgressTabs.Trigger
                    className="w-full"
                    value={AmcCreateTab.AMC_PRICE}
                    status={tabState[AmcCreateTab.AMC_PRICE]}
                  >
                    AMC Price
                  </ProgressTabs.Trigger>
                </ProgressTabs.List>
              </div>
            </div>
          </RouteFocusModal.Header>
          <RouteFocusModal.Body className="size-full overflow-hidden">
            <ProgressTabs.Content
              value={AmcCreateTab.AMC_DETAILS}
              className="flex flex-col items-center overflow-y-auto"
            >
              <div className="flex size-full max-w-3xl flex-col gap-4 p-16">
                <Controller
                  control={props.form.control}
                  name="title"
                  rules={{ required: "Title is required" }}
                  render={({ field }) => {
                    return (
                      <div>
                        <Label>Title</Label>
                        <Input className="m-0 gap-0" {...field} />
                        <ErrorMessage form={props.form} field={field.name} />
                      </div>
                    );
                  }}
                />
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Controller
                    control={props.form.control}
                    name="sku"
                    rules={{ required: "SKU is required" }}
                    render={({ field }) => {
                      return (
                        <div>
                          <Label>SKU</Label>
                          <Input autoComplete="off" {...field} />
                          <ErrorMessage form={props.form} field={field.name} />
                        </div>
                      );
                    }}
                  />
                  <Controller
                    control={props.form.control}
                    name="barcode"
                    rules={{ required: "Barcode is required" }}
                    render={({ field }) => {
                      return (
                        <div>
                          <Label>Barcode</Label>
                          <Input autoComplete="off" {...field} />
                          <ErrorMessage form={props.form} field={field.name} />
                        </div>
                      );
                    }}
                  />
                </div>
              </div>
            </ProgressTabs.Content>

            <ProgressTabs.Content value={AmcCreateTab.AMC_PRODUCTS}>
              <Container>
                <VariantTable form={props.form} />
              </Container>
            </ProgressTabs.Content>

            <ProgressTabs.Content value={AmcCreateTab.AMC_PRICE}>
              <VariantPricingForm form={props.form} />
            </ProgressTabs.Content>
          </RouteFocusModal.Body>
        </ProgressTabs>
        <RouteFocusModal.Footer>
          <div className="flex items-center justify-end gap-x-2">
            <RouteFocusModal.Close asChild>
              <Button variant="secondary" size="small">
                Cancel
              </Button>
            </RouteFocusModal.Close>

            <Button
              key="continue-btn"
              type="button"
              onClick={handleContinue}
              size="small"
            >
              {tab === AmcCreateTab.AMC_PRICE ? (
                props.form.formState.isSubmitting ? (
                  <Spinner className="animate-spin" />
                ) : (
                  "Create Order"
                )
              ) : (
                "Continue"
              )}
            </Button>
          </div>
        </RouteFocusModal.Footer>
      </KeyboundForm>
    </RouteFocusModal>
  );
};

export default AmcDetail;
