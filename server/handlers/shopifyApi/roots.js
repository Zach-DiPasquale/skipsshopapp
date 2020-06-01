import { ApiVersion } from "@shopify/koa-shopify-graphql-proxy";

const basePath = `/admin/api/${ApiVersion.April20}`;

export const JSONpath = ".json";

export const productGetUpdate = (host, id) =>
  `https://${host}${basePath}/products/${id}.json`;

export const productCreate = (host) =>
  `https://${host}${basePath}/products.json`;

export const variants = (host, productId, variantId) =>
  `https://${host}${basePath}/products/${productId}/variants/${variantId}.json`;
