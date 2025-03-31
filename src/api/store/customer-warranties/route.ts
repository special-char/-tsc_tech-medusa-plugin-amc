import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework";

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const query = req.scope.resolve("query");

  const amc = await query.graph({
    entity: "warranty_transactions",
    fields: ["*"],
    pagination: {
      take:
        typeof req.query.limit === "string"
          ? parseInt(req.query.limit, 10) || 50
          : 50,
      skip:
        typeof req.query.offset === "string"
          ? parseInt(req.query.offset, 10) || 0
          : typeof req.query.offset === "number"
          ? req.query.offset
          : 0,
    },
    filters: {
      ...(req.query.variant_id && { variant_id: req.query.variant_id }),
      ...(req.query.order_line_item_id && {
        order_line_item_id: req.query.order_line_item_id,
      }),
      customer_id: req.auth_context.actor_id,
    },
  });

  // Group warranties by customer, variant, and order.
  // For each group, we track the earliest startDate, latest endDate,
  // and aggregate all warranty details.
  const groupedData = Object.values(
    amc.data.reduce(
      (acc, item) => {
        const {
          customer_id,
          variant_id,
          order_line_item_id,
          start_date,
          end_date,
          ...otherDetails
        } = item;
        const key = `${customer_id}_${variant_id}_${order_line_item_id}`;
        const warrantyStart = new Date(start_date);
        const warrantyEnd = new Date(end_date);

        // Create a new group if it doesn't exist
        if (!acc[key]) {
          acc[key] = {
            customer_id: customer_id,
            variant_id: variant_id,
            order_line_item_id: order_line_item_id,
            // Initialize group-level start/end with current warranty values
            start_date: start_date,
            end_date: end_date,
            // Calculate the group-level warranty availability based on the end date
            // (this could be based on the latest end date)
            isWarrantyAvailable: warrantyEnd > new Date(),
            details: [],
          };
        } else {
          // Update the group's earliest start date if necessary
          if (warrantyStart < new Date(acc[key].startDate)) {
            acc[key].start_date = start_date;
          }
          // Update the group's latest end date if necessary
          if (warrantyEnd > new Date(acc[key].endDate)) {
            acc[key].end_date = end_date;
          }
        }

        // Add this warranty's details
        acc[key].details.push({
          start_date: start_date,
          end_date: end_date,
          ...otherDetails,
        });

        return acc;
      },
      {} as Record<
        string,
        {
          customer_id: string;
          variant_id: string;
          order_line_item_id: string;
          start_date: string;
          end_date: string;
          isWarrantyAvailable: boolean;
          details: Array<{
            start_date: string;
            end_date: string;
            isWarrantyAvailable: boolean;
            [key: string]: any;
          }>;
        }
      >
    )
  );

  res.send(groupedData);
};
