import { Controller, UseFormReturn } from "react-hook-form";
import { RouteFocusModal } from "../common/modals";
import { KeyboundForm } from "../common/keybound-form";
import {
  Button,
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
import Required from "../common/Required";

type Props = {
  form: UseFormReturn<any, any, undefined>;
  onSubmit: (data: any) => void;
  amcId?: string;
  productId?: string;
};

export enum AmcCreateTab {
  AMC_DETAILS = "amc-details",
  AMC_PRODUCTS = "amc-products",
  AMC_PRICE = "amc-price",
}

type TabState = Record<AmcCreateTab, ProgressStatus>;
const AmcDetail = (props: Props) => {
  const isProduct = !!props.productId;
  const [tab, setTab] = useState<AmcCreateTab>(AmcCreateTab.AMC_DETAILS);

  const [tabState, setTabState] = useState<TabState>({
    [AmcCreateTab.AMC_DETAILS]: "in-progress",
    [AmcCreateTab.AMC_PRODUCTS]: "not-started",
    [AmcCreateTab.AMC_PRICE]: "not-started",
  });

  const handleTabChange = async (tab: AmcCreateTab) => {
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
    if (tab === AmcCreateTab.AMC_PRODUCTS) {
      const valid = await props.form.trigger([
        "title",
        "sku",
        "barcode",
        "duration",
      ]);
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
      const variant = props.form.watch("variant_id");

      const valid =
        (await props.form.trigger([
          "title",
          "sku",
          "barcode",
          "variant_id",
          "duration",
        ])) &&
        Array.isArray(variant) &&
        variant.length > 0;

      if (!valid) {
        props.form.setError("variant_id", {
          message: "Please select a variant",
        });
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
        const valid = await props.form.trigger([
          "title",
          "sku",
          "barcode",
          "duration",
        ]);
        if (valid) {
          handleTabChange(AmcCreateTab.AMC_PRODUCTS);
        }
        break;
      }
      case AmcCreateTab.AMC_PRODUCTS: {
        const variant = props.form.watch("variant_id");

        const valid =
          (await props.form.trigger([
            "title",
            "sku",
            "barcode",
            "variant_id",
          ])) &&
          Array.isArray(variant) &&
          variant.length > 0;

        if (valid) {
          handleTabChange(AmcCreateTab.AMC_PRICE);
        }
        props.form.setError("variant_id", {
          message: "Please select a variant",
        });
        break;
      }
      case AmcCreateTab.AMC_PRICE:
        await props.form.handleSubmit(props.onSubmit)();
        break;
    }
  };

  const ParentComponent = isProduct ? "div" : RouteFocusModal;
  const HeaderComponent = isProduct ? "div" : RouteFocusModal.Header;
  const BodyComponent = isProduct ? "div" : RouteFocusModal.Body;
  const FooterComponent = isProduct ? "div" : RouteFocusModal.Footer;
  return (
    <ParentComponent className="flex flex-1">
      <KeyboundForm
        hidden={true}
        className="flex h-full flex-1 flex-col"
        onSubmit={props.form.handleSubmit(props.onSubmit)}
      >
        <ProgressTabs
          value={tab}
          onValueChange={(v) => handleTabChange(v as AmcCreateTab)}
          className="flex h-full flex-col overflow-hidden"
        >
          <HeaderComponent>
            <div className="flex w-full items-center justify-between gap-x-4">
              <div className="-my-2 w-full max-w-[600px] border-l">
                <ProgressTabs.List className="grid w-full  grid-cols-4">
                  <ProgressTabs.Trigger
                    className={`w-full`}
                    value={AmcCreateTab.AMC_DETAILS}
                    status={tabState[AmcCreateTab.AMC_DETAILS]}
                  >
                    AMC Details
                  </ProgressTabs.Trigger>

                  <ProgressTabs.Trigger
                    className={`w-full`}
                    value={AmcCreateTab.AMC_PRODUCTS}
                    status={tabState[AmcCreateTab.AMC_PRODUCTS]}
                  >
                    AMC Products
                  </ProgressTabs.Trigger>
                  <ProgressTabs.Trigger
                    className={`w-full`}
                    value={AmcCreateTab.AMC_PRICE}
                    status={tabState[AmcCreateTab.AMC_PRICE]}
                  >
                    AMC Price
                  </ProgressTabs.Trigger>
                </ProgressTabs.List>
              </div>
            </div>
          </HeaderComponent>
          <BodyComponent className="size-full overflow-hidden">
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
                        <Label>
                          Title <Required />
                        </Label>
                        <Input
                          className="m-0 gap-0"
                          placeholder="AMC 1"
                          {...field}
                        />
                        <ErrorMessage form={props.form} field={field.name} />
                      </div>
                    );
                  }}
                />
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Controller
                    control={props.form.control}
                    name="sku"
                    render={({ field }) => {
                      return (
                        <div>
                          <Label>SKU</Label>
                          <Input
                            autoComplete="off"
                            placeholder="t-shirt-black"
                            {...field}
                          />
                          <ErrorMessage form={props.form} field={field.name} />
                        </div>
                      );
                    }}
                  />
                  <Controller
                    control={props.form.control}
                    name="duration"
                    rules={{ required: "Duration is required" }}
                    render={({ field }) => {
                      return (
                        <div>
                          <Label>
                            Duration (in Days) <Required />
                          </Label>
                          <Input
                            autoComplete="off"
                            type="number"
                            placeholder="365"
                            {...field}
                          />
                          <ErrorMessage form={props.form} field={field.name} />
                        </div>
                      );
                    }}
                  />
                  <Controller
                    control={props.form.control}
                    name="barcode"
                    render={({ field }) => {
                      return (
                        <div>
                          <Label>Barcode</Label>
                          <Input
                            autoComplete="off"
                            placeholder="AD21M2JAK"
                            {...field}
                          />
                          <ErrorMessage form={props.form} field={field.name} />
                        </div>
                      );
                    }}
                  />
                </div>
              </div>
            </ProgressTabs.Content>

            <ProgressTabs.Content value={AmcCreateTab.AMC_PRODUCTS}>
              <VariantTable form={props.form} productId={props.productId} />
            </ProgressTabs.Content>

            <ProgressTabs.Content value={AmcCreateTab.AMC_PRICE}>
              <VariantPricingForm form={props.form} />
            </ProgressTabs.Content>
          </BodyComponent>
        </ProgressTabs>
        <FooterComponent className="p-4">
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
                ) : props.amcId ? (
                  "Update AMC"
                ) : (
                  "Create AMC"
                )
              ) : (
                "Continue"
              )}
            </Button>
          </div>
        </FooterComponent>
      </KeyboundForm>
    </ParentComponent>
  );
};

export default AmcDetail;
