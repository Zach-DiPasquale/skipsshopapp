import { getConnection } from "typeorm";
import { Access } from "../../database/models/Access";

export const getAccess = async (shop) => {
  return await getConnection()
    .getRepository(Access)
    .createQueryBuilder("access")
    .where("access.shop = :shop", { shop: shop })
    .getOne();
};
