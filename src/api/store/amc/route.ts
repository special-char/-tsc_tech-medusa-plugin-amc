import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const query = req.scope.resolve("query");

  const amc = await query.graph({
    entity: "amc",
    fields: ["*", "price_set.prices.*", "product_variants.*"],
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
  });

  amc.data;
  res.send({
    amc: amc.data,
    count: amc.metadata?.count,
    limit: amc.metadata?.take,
    offset: amc.metadata?.skip,
  });
};
