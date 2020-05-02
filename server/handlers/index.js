import { createClient } from "./client";
import { getOneTimeUrl } from "./mutations/get-one-time-url";
import { getSubscriptionUrl } from "./mutations/get-subscription-url";
import { registerWebhooks } from "./register-webhooks";
import { ApiVersion } from "@shopify/koa-shopify-graphql-proxy";

export { createClient, getOneTimeUrl, getSubscriptionUrl, registerWebhooks };


export const registerProductUpdate = async (shop, accessToken) => {
    await registerWebhooks(
        shop,
        accessToken,
        "PRODUCTS_UPDATE",
        "/webhooks/products/update",
        ApiVersion.April20
      );
}