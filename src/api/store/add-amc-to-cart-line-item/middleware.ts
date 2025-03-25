import {
  MiddlewareRoute,
  validateAndTransformBody,
  validateAndTransformQuery,
} from "@medusajs/framework";
import {
  retrieveCartTransformQueryConfig,
  StoreAddCartLineItem,
  StoreGetCartsCart,
} from "./validator";

export const amcRoutesMiddlewares: MiddlewareRoute[] = [
  {
    matcher: "/store/add-amc-to-cart-line-item",
    method: "POST",
    middlewares: [
      validateAndTransformBody(StoreAddCartLineItem),
      validateAndTransformQuery(
        StoreGetCartsCart,
        retrieveCartTransformQueryConfig
      ),
    ],
  },
];
