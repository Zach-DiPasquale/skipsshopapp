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
 * Gets a product from the DB
 *
 * @param {string} variantShopifyProductId  - base shopify product ID
 *
 * @returns one Product
 */
export const getProductByVariantId = async (variantShopifyProductId) => {
  return await getConnection()
    .getRepository(Product)
    .createQueryBuilder("product")
    .where("product.variantShopifyProductId = :id", {
      id: variantShopifyProductId,
    })
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
    .set({
      variantShopifyProductId: product.variantShopifyProductId,
      sellByWeight: product.sellByWeight,
      weightUnit: product.weightUnit,
      priceStringMetafieldShopifyId: product.priceStringMetafieldShopifyId,
      priceLabel: product.priceLabel,
      priceLabelMetafieldShopifyId: product.priceLabelMetafieldShopifyId,
      additionalLabel: product.additionalLabel,
      additionalLabelMetafieldShopifyId:
        product.additionalLabelMetafieldShopifyId,
    })
    .where("baseShopifyProductId = :id", { id: product.baseShopifyProductId })
    .execute()
    .catch((e) => console.log(e));
};

export const getAllVariantsForProductId = async (productId) => {
  let product = await getProduct(productId);

  if (!product) {
    product = await getProductByVariantId(productId);
  }

  if (!product) return null;

  console.log(product);

  product.variantGroups = await getConnection()
    .createQueryBuilder()
    .relation(Product, "variantGroups")
    .of(product.baseShopifyProductId)
    .loadMany();
  for (let index = 0; index < product.variantGroups.length; index++) {
    const variantGroup = product.variantGroups[index];
    let variants = await getAllVariants(variantGroup.id);
    product.variantGroups[index].variants = variants;
  }
  return product;
};
