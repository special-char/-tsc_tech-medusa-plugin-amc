import { defineMiddlewares } from "@medusajs/framework";
import { amcRoutesMiddlewares } from "./store/add-amc-to-cart-line-item/middleware";

export default defineMiddlewares([...amcRoutesMiddlewares]);
