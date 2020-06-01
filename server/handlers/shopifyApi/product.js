import fetch from "node-fetch";

import { productGetUpdate, productCreate } from "./roots";

export const getShopifyProduct = async (shop, accessToken, productId) => {
  return fetch(productGetUpdate(shop, productId), {
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": accessToken,
    },
  })
    .then((res) => res.json())
    .then((json) => json);
};

export const createShopifyProduct = async (shop, accessToken, product) => {
  return fetch(productCreate(shop), {
    method: "POST",
    body: JSON.stringify({ product }),
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": accessToken,
    },
  })
    .then((res) => res.json())
    .then((json) => json)
    .catch(() => {
      console.warn(`Something went wrong when creating a product ${e}`);
    });
};

export const updateShopifyProduct = async (shop, accessToken, product) => {
  return fetch(productGetUpdate(shop, product.id), {
    method: "PUT",
    body: JSON.stringify({ product }),
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": accessToken,
    },
  })
    .then((res) => res.json())
    .then((json) => json)
    .catch((e) => {
      console.warn(`Something went wrong when updating a product ${e}`);
    });
};

export const duplicateShopifyProduct = async (shop, accessToken, product) => {
  let newProduct = {
    title: product.title,
    handle: product.handle,
    product_type: product.product_type,
    published: false,
    published_scope: "global",
  };

  let updatedBaseProduct = {
    id: product.id,
    title: `AUTOMATIC (DO NOT TOUCH) ${product.title}`,
    handle: `auth-${product.handle}`,
    published: false,
  };

  await updateShopifyProduct(shop, accessToken, updatedBaseProduct);

  let newProductResponse = await createShopifyProduct(
    shop,
    accessToken,
    newProduct
  );
  return newProductResponse.product;
};
