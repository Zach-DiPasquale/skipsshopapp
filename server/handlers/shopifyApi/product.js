import fetch from "node-fetch";

import {
  productGetUpdate,
  productCreate,
  productMetafieldCreate,
  productMetafieldUpdate,
} from "./roots";

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

export const updateShopifyProduct2 = async (shop, accessToken, product) => {
  return fetch(productGetUpdate(shop, product.id), {
    method: "PUT",
    body: JSON.stringify({ product }),
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": accessToken,
    },
  });
};

export const updateShopifyProduct = async (shop, accessToken, product) => {
  return updateShopifyProduct2(shop, accessToken, product)
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
    tags: `visible`,
  };

  let updatedBaseProduct = {
    id: product.id,
    handle: `auto-${product.handle}`,
    published: false,
    tags: `${product.tags}, source`,
  };

  await updateShopifyProduct(shop, accessToken, updatedBaseProduct);

  let newProductResponse = await createShopifyProduct(
    shop,
    accessToken,
    newProduct
  );

  updatedBaseProduct = {
    id: product.id,
    body_html: `If you see this product please contact us! <a href="/products/${newProductResponse.product.handle}">Click here to go to the correct product</a>`,
    published: false,
  };

  await updateShopifyProduct(shop, accessToken, updatedBaseProduct);

  return newProductResponse.product;
};

export const createShopifyProductMetafield = async (
  shop,
  accessToken,
  productId,
  metafield
) => {
  return fetch(productMetafieldCreate(shop, productId), {
    method: "POST",
    body: JSON.stringify({ metafield }),
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": accessToken,
    },
  })
    .then((res) => res.json())
    .then((json) => json)
    .catch(() => {
      console.warn(
        `Something went wrong when creating the product metafield. The unit price is likely not being displayed on the website. ${e}`
      );
    });
};

export const updateShopifyProductMetadata = async (
  shop,
  accessToken,
  productId,
  metafield
) => {
  return fetch(productMetafieldUpdate(shop, productId, metafield.id), {
    method: "PUT",
    body: JSON.stringify({ metafield }),
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": accessToken,
    },
  })
    .then((res) => res.json())
    .then((json) => json)
    .catch((e) => {
      console.warn(
        `Something went wrong when updating the product metafield. The unit price is likely not being displayed on the website. ${e}`
      );
    });
};

export const deleteShopifyProductMetadata = async (
  shop,
  accessToken,
  productId,
  metafieldId
) => {
  return fetch(productMetafieldUpdate(shop, productId, metafieldId), {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": accessToken,
    },
  })
    .then((res) => res.json())
    .then((json) => json)
    .catch((e) => {
      console.warn(
        `Something went wrong when deleting the product metafield. The unit price is likely not being displayed on the website. ${e}`
      );
    });
};
