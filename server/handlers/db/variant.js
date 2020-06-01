import { Variant } from "../../database/models/Variant";
import { getConnection } from "typeorm";

export const createVariant = async (variant) => {
  return await getConnection()
    .createQueryBuilder()
    .insert()
    .into(Variant)
    .values(variant)
    .execute()
    .then((r) => r.identifiers[0].id);
};

export const updateVariant = async (variant) => {
  return await getConnection()
    .createQueryBuilder()
    .update(Variant)
    .set({
      label: variant.label,
      modifierValue: variant.modifierValue,
      variantGroup: variant.variantGroup,
    })
    .where("id = :id", { id: variant.id })
    .execute();
};

export const deleteVariant = async (variantId) => {
  return await getConnection()
    .createQueryBuilder()
    .delete()
    .from(Variant)
    .where("id = :id", { id: variantId })
    .execute();
};
