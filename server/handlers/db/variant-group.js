import { VariantGroup } from "../../database/models/VariantGroup";
import { getConnection } from "typeorm";

export const createVariantGroup = async (variantGroup) => {
  return await getConnection()
    .createQueryBuilder()
    .insert()
    .into(VariantGroup)
    .values(variantGroup)
    .execute()
    .then((r) => r.identifiers[0].id);
};

export const getAllVariants = async (variantGroupId) => {
  let variants = await getConnection()
    .createQueryBuilder()
    .relation(VariantGroup, "variants")
    .of(variantGroupId) // you can use just post id as well
    .loadMany();
  return variants;
};

export const deleteVariantGroup = async (variantGroupId) => {
  return await getConnection()
    .createQueryBuilder()
    .delete()
    .from(VariantGroup)
    .where("id = :id", { id: variantGroupId })
    .execute();
};
