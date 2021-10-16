import { variants } from "./routes";

/**
 *
 * @param {*} shop
 * @param {*} accessToken
 * @param {*} productId
 * @param {*} variantId
 * @returns
 */
export const deleteShopifyVariant = async (
  shop,
  accessToken,
  productId,
  variantId
) => {
  return fetch(variants(shop, productId, variantId), {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": accessToken,
    },
  })
    .then((res) => res.json())
    .then((json) => json);
};
