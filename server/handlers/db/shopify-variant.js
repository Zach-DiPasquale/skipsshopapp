import { getConnection } from "typeorm";
import { ShopifyVariant } from "../../database/models/ShopifyVariant";

export const createShopifyVariants = async (shopifyVariant) => {
  return await getConnection()
    .createQueryBuilder()
    .insert()
    .into(ShopifyVariant)
    .values(shopifyVariant)
    .execute()
    .then((r) => r.identifiers[0].id);
};

export const getAllShopifyVariants = async (productId) => {
  let variants = await getConnection()
    .getRepository(ShopifyVariant)
    .createQueryBuilder("variant")
    .where("variant.shopifyProductId = :id", { id: productId })
    .getMany();
  return variants;
};

export const deleteAllShopifyVariants = async (productId) => {
  return await getConnection()
    .createQueryBuilder()
    .delete()
    .from(ShopifyVariant)
    .where("shopifyProductId = :id", { id: productId })
    .execute();
};
