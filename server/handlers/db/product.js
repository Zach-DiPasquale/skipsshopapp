import { Product } from "../../database/models/Product";
import {
  getShopifyProduct,
  duplicateShopifyProduct,
} from "../shopifyApi/product";
import { getConnection } from "typeorm";
import { getAllVariants } from "./variant-group";

/**
 * Gets a product from the DB
 *
 * @param {string} baseShopifyProductId  - base shopify product ID
 *
 * @returns one Product
 */
export const getProduct = async (baseShopifyProductId) => {
  return await getConnection()
    .getRepository(Product)
    .createQueryBuilder("product")
    .where("product.baseShopifyProductId = :id", { id: baseShopifyProductId })
    .getOne();
};

/**
 * Creates and saves a product
 *
 * @param {string} baseShopifyProductId  - base shopify product ID
 *
 * @returns typeorm insertion metadata
 *
 */
export const createProduct = async (baseShopifyProductId) => {
  return await getConnection()
    .createQueryBuilder()
    .insert()
    .into(Product)
    .values({ baseShopifyProductId })
    .execute();
};

export const createShopifyVariantProduct = async (
  shop,
  accessToken,
  baseShopifyProductId
) => {
  let productResp = await getShopifyProduct(
    shop,
    accessToken,
    baseShopifyProductId
  );
  return await duplicateShopifyProduct(shop, accessToken, productResp.product);
};

export const updateShopifyProduct = async (product) => {
  return await getConnection()
    .createQueryBuilder()
    .update(Product)
    .set({ variantShopifyProductId: product.variantShopifyProductId })
    .where("baseShopifyProductId = :id", { id: product.baseShopifyProductId })
    .execute()
    .catch((e) => console.log(e));
};

export const getAllVariantsForProductId = async (productId) => {
  let product = await getProduct(productId);
  if (!product) return null;
  product.variantGroups = await getConnection()
    .createQueryBuilder()
    .relation(Product, "variantGroups")
    .of(productId) // you can use just post id as well
    .loadMany();
  for (let index = 0; index < product.variantGroups.length; index++) {
    const variantGroup = product.variantGroups[index];
    let variants = await getAllVariants(variantGroup.id);
    product.variantGroups[index].variants = variants;
  }
  return product;
};
