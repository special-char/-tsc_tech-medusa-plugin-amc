import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { DetailWidgetProps, AdminProduct } from "@medusajs/framework/types"
import { clx, Container, Heading, Text, Button, Prompt, Input, toast } from "@medusajs/ui"
import { sdk } from "../lib/sdk"
import { useState, useEffect } from "react"
import { PencilSquare } from "@medusajs/icons"

const ProductWarrantyWidget = ({
    data: product,
}: DetailWidgetProps<AdminProduct & any>) => {
    const [variantData, setVariantData] = useState<any>(null)
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [warrantyDays, setWarrantyDays] = useState<number | string>("")
    const [serviceInterval, setServiceInterval] = useState<number | string>("")
    // Fetch variant data
    useEffect(() => {
        const fetchVariantData = async () => {
            try {
                const res = await sdk.admin.product.retrieveVariant(
                    product.product_id,
                    product.id,
                    {
                        fields: "*inventory_items,*inventory_items.inventory,*inventory_items.inventory.location_levels,*options,*options.option,*prices,*prices.price_rules,*product_warranty_terms",
                    }
                )
                setVariantData(res.variant)
                setWarrantyDays(res.variant?.product_warranty_terms?.days || "")
                setServiceInterval(res.variant?.product_warranty_terms?.service_interval || "")
            } catch (error) {
                console.error("Error fetching variant data:", error)
            }
        }

        fetchVariantData()
    }, [product.product_id, product.id])

    // Update warranty days function
    const updateWarrantyDays = async () => {
        try {
            setIsLoading(true)
            const response = await sdk.admin.product.updateVariant(product.product_id, product.id, {
                metadata: {
                    days: Number(warrantyDays),
                    service_interval: Number(serviceInterval),
                },
            })
            toast.success("Warranty updated successfully",)

            // Update local state after successful update
            setVariantData((prev: any) => ({
                ...prev,
                product_warranty_terms: {
                    ...prev.product_warranty_terms,
                    days: Number(warrantyDays),
                    service_interval: Number(serviceInterval),
                },
            }))
        } catch (error) {
            toast.error("There was an error updating the warranty.")

            console.error("Error updating warranty days:", error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Container className="divide-y p-0">
            <div className="flex items-center justify-between px-6 py-4">
                <Heading level="h2">Warranty</Heading>
                <Prompt variant="confirmation">
                    <Prompt.Trigger asChild>
                        <Button
                            size="small"
                            variant="secondary"
                            className="flex items-center gap-2"
                        >
                            <PencilSquare />
                            Edit
                        </Button>
                    </Prompt.Trigger>
                    <Prompt.Content>
                        <Prompt.Header>
                            <Prompt.Title>Edit Warranty</Prompt.Title>
                            <Prompt.Description>
                                Please enter the new warranty period in days.
                            </Prompt.Description>
                            <div className="grid grid-cols-1 gap-4">
                                <Input
                                    type="number"
                                    min={1}
                                    value={warrantyDays}
                                    placeholder="Warranty period (days)"
                                    onChange={(e) => setWarrantyDays(e.target.value)}
                                />
                                <Input
                                    type="number"
                                    min={1}
                                    value={serviceInterval}
                                    placeholder="Service interval (days)"
                                    onChange={(e) => setServiceInterval(e.target.value)}
                                />
                            </div>
                        </Prompt.Header>
                        <Prompt.Footer>
                            <Prompt.Cancel>Cancel</Prompt.Cancel>
                            <Prompt.Action
                                onClick={updateWarrantyDays}
                                disabled={isLoading || isNaN(Number(warrantyDays)) || Number(warrantyDays) <= 0 || isNaN(Number(serviceInterval)) || Number(serviceInterval) <= 0}
                            >
                                {isLoading ? "Updating..." : "Update"}
                            </Prompt.Action>
                        </Prompt.Footer>
                    </Prompt.Content>
                </Prompt>
            </div>
            <div
                className={clx(
                    `text-ui-fg-subtle grid grid-cols-2 items-center px-6 py-4 gap-2`
                )}
            >
                <Text size="small" weight="plus" leading="compact">
                    Duration (Days)
                </Text>
                <Text
                    size="small"
                    leading="compact"
                    className="whitespace-pre-line text-pretty"
                >
                    {variantData?.product_warranty_terms?.days || "No Warranty"}
                </Text>
                <Text size="small" weight="plus" leading="compact">
                    Service Interval (Days)
                </Text>
                <Text
                    size="small"
                    leading="compact"
                    className="whitespace-pre-line text-pretty"
                >
                    {variantData?.product_warranty_terms?.service_interval || "-"}
                </Text>
            </div>
        </Container>
    )
}

export const config = defineWidgetConfig({
    zone: "product_variant.details.side.after",
})

export default ProductWarrantyWidget
