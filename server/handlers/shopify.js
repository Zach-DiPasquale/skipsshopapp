import { createVariant, deleteVariant } from "./db/variant";
import { VariantGroupType } from "../database/models/VariantGroup";
import { Variant } from "../database/models/Variant";
import {
  getAllVariantsForProductId,
  getProduct,
  updateShopifyProduct as updateProduct,
} from "./db/product";
import { deleteShopifyVariant } from "./shopifyApi/variants";
import { deleteVariantGroup } from "./db/variant-group";
import {
  updateShopifyProduct,
  getShopifyProduct,
  updateShopifyProductMetadata,
  createShopifyProductMetafield,
  deleteShopifyProductMetadata,
} from "./shopifyApi/product";
import { ShopifyVariant } from "../database/models/ShopifyVariant";
import {
  deleteAllShopifyVariants as removeAllShopVariants,
  createShopifyVariants,
  getAllShopifyVariants,
} from "./db/shopify-variant";
import { getAccess } from "./db/access";

export const createUpdateVariants = async (variants, variantGroup) => {
  let variantIdList = [];

  for (let index = 0; index < variants.length; index++) {
    const o = variants[index];
    const variant = new Variant();
    variant.variantGroup = variantGroup;
    variant.label = o.label;
    variant.modifierValue = 0;
    if (variantGroup.modifierType !== VariantGroupType.NONE) {
      variant.modifierValue = o.modifierValue;
    }
    let vid = await createVariant(variant);
    variantIdList.push(vid);
  }

  return variantIdList;
};

export const deleteAllShopifyVariants = async (
  shop,
  accessToken,
  productId
) => {
  let product = await getAllVariantsForProductId(productId);
  await removeAllShopVariants(productId);

  for (let index = 0; index < product.variantGroups.length; index++) {
    const vg = product.variantGroups[index];

    for (let index = 0; index < vg.variants.length; index++) {
      const v = vg.variants[index];
      await deleteVariant(v.id);
      await deleteShopifyVariant(shop, accessToken, productId, v.id);
    }
    await deleteVariantGroup(vg.id);
  }
};

export const syncVariants = async (shop, accessToken, productId) => {
  let product = await getAllVariantsForProductId(productId);

  if (product.variantGroups > 3) {
    throw RangeError("Only three variants options allowed");
  }

  // update product options
  let options = [];

  let rootShopifyVariant = (
    await getShopifyProduct(shop, accessToken, productId)
  ).product.variants[0];

  let productUnitPrice = rootShopifyVariant.price;
  let isProductTaxable = rootShopifyVariant.taxable;

  let variantGroups = sortVariantGroups(product.variantGroups);

  let optionList1 = variantGroups[0].variants;
  let optionList2 = [];
  let optionList3 = [];

  if (variantGroups.length > 1) {
    optionList2 = variantGroups[1].variants;
  }

  if (variantGroups.length > 2) {
    optionList3 = variantGroups[2].variants;
  }

  let variants = createVariantCombos(
    optionList1,
    optionList2,
    optionList3,
    variantGroups,
    productUnitPrice,
    isProductTaxable,
    productId
  );

  variantGroups.map((v, index) => {
    options.push({
      name: v.name,
      position: index + 1,
      values: [],
    });

    v.variants.map((vi, i) => {
      let label = vi.label;
      if (v.modifierType === VariantGroupType.WEIGHT) {
        label = `${label}`;
      }
      options[index].values.push(label);
    });
  });

  if (variants.length === 0) {
    variants = [
      {
        price: productUnitPrice,
        title: "Default Variant",
      },
    ];
  }

  let updatedProduct = {
    id: product.variantShopifyProductId,
    options,
    variants,
  };

  let res = await updateShopifyProduct(shop, accessToken, updatedProduct);
  if (res.errors) {
    return { error: true, message: res.errors };
  }
  if (variants.length > 0 && res.product && res.product.variants) {
    res.product.variants.forEach((v, i) => {
      variants[i].shopifyVariantId = v.id;
      variants[i].position = v.position;
    });
  }
  await createShopifyVariants(variants);

  await updateMetafields(shop, accessToken, product, productUnitPrice);

  return { error: false, message: "" };
};

const createVariantCombos = (
  option1,
  option2,
  option3,
  variantGroups,
  productUnitPrice,
  isTaxable,
  productId
) => {
  let variants = [];
  if (option3.length >= 1) {
    option3.forEach((o3) => {
      option2.forEach((o2) => {
        option1.forEach((o1) => {
          const sv = new ShopifyVariant();
          let price = parseFloat(productUnitPrice);
          sv.shopifyProductId = productId;
          sv.option1 = o1.label;
          sv.option2 = o2.label;
          sv.option3 = o3.label;

          sv.option1Variant = o1.id;
          sv.option2Variant = o2.id;
          sv.option3Variant = o3.id;

          sv.inventory_policy = "continue";
          sv.taxable = isTaxable;

          if (variantGroups[0].modifierType === VariantGroupType.WEIGHT) {
            let multiplier = parseFloat(o1.modifierValue / 16);
            price = price * multiplier;
            sv.toMultiply = multiplier;
            sv.weight = o1.modifierValue;
            sv.weight_unit = "oz";
          } else if (variantGroups[0].modifierType === VariantGroupType.FEE) {
            let toAdd = parseFloat(o1.modifierValue);
            price += parseFloat(toAdd);
            sv.toAdd += parseFloat(toAdd);
          }

          if (variantGroups[1].modifierType === VariantGroupType.FEE) {
            let toAdd = parseFloat(o2.modifierValue);
            price += parseFloat(toAdd);
            sv.toAdd += parseFloat(toAdd);
          }

          if (variantGroups[2].modifierType === VariantGroupType.FEE) {
            let toAdd = parseFloat(o3.modifierValue);
            price += parseFloat(toAdd);
            sv.toAdd += toAdd;
          }
          sv.price = price;
          variants.push(sv);
        });
      });
    });
  } else if (option2.length >= 1) {
    option2.forEach((o2) => {
      option1.forEach((o1) => {
        const sv = new ShopifyVariant();
        let price = parseFloat(productUnitPrice);
        sv.shopifyProductId = productId;
        sv.option1 = o1.label;
        sv.option2 = o2.label;

        sv.option1Variant = o1.id;
        sv.option2Variant = o2.id;

        sv.inventory_policy = "continue";
        sv.taxable = isTaxable;

        if (variantGroups[0].modifierType === VariantGroupType.WEIGHT) {
          let multiplier = parseFloat(o1.modifierValue / 16);
          price = price * multiplier;
          sv.toMultiply = multiplier;
          sv.weight = o1.modifierValue;
          sv.weight_unit = "oz";
        } else if (variantGroups[0].modifierType === VariantGroupType.FEE) {
          let toAdd = parseFloat(o1.modifierValue);
          price += parseFloat(toAdd);
          sv.toAdd += parseFloat(toAdd);
        }

        if (variantGroups[1].modifierType === VariantGroupType.FEE) {
          let toAdd = parseFloat(o2.modifierValue);
          price += parseFloat(toAdd);
          sv.toAdd += parseFloat(toAdd);
        }

        sv.price = price;
        variants.push(sv);
      });
    });
  } else if (option1.length >= 1) {
    option1.forEach((o1) => {
      const sv = new ShopifyVariant();
      let price = parseFloat(productUnitPrice);
      sv.shopifyProductId = productId;
      sv.option1 = o1.label;

      sv.option1Variant = o1.id;

      sv.inventory_policy = "continue";
      sv.taxable = isTaxable;

      if (variantGroups[0].modifierType === VariantGroupType.WEIGHT) {
        let multiplier = parseFloat(o1.modifierValue / 16);
        price = price * multiplier;
        sv.toMultiply = multiplier;
        sv.weight = o1.modifierValue;
        sv.weight_unit = "oz";
      } else if (variantGroups[0].modifierType === VariantGroupType.FEE) {
        let toAdd = parseFloat(o1.modifierValue);
        price += parseFloat(toAdd);
        sv.toAdd += parseFloat(toAdd);
      }

      sv.price = price;
      variants.push(sv);
    });
  }
  return variants;
};

const sortVariantGroups = (variantGroups) => {
  return variantGroups.sort((a, b) => {
    if (a.modifierType === VariantGroupType.WEIGHT) {
      return -1;
    }
    if (
      a.modifierType === VariantGroupType.FEE &&
      b.modifierType === VariantGroupType.NONE
    ) {
      return -1;
    }
    return 0;
  });
};

export const autoUpdateVariants = async (shop, product) => {
  let access = await getAccess(shop);
  let p = await getProduct(product.id);
  if (p) {
    let allVariants = await getAllShopifyVariants(p.baseShopifyProductId);
    allVariants.sort((a, b) => a.position - b.position);
    let newVariants = allVariants.map((v) => {
      let newV = {};
      newV.price =
        parseFloat(product.variants[0].price) * parseFloat(v.toMultiply) +
        parseFloat(v.toAdd);

      newV.id = v.shopifyVariantId;

      return newV;
    });

    let res = await updateShopifyProduct(shop, access.oauthToken, {
      id: p.variantShopifyProductId,
      variants: newVariants,
    });

    updateMetafields(shop, access.oauthToken, p, product.variants[0].price);
  }
};

const updateMetafields = async (
  shop,
  accessToken,
  product,
  productUnitPrice
) => {
  createUpdateDeletePriceStringMetafield(
    shop,
    accessToken,
    product,
    productUnitPrice
  );
  createUpdateDeletePriceLabelMetafield(shop, accessToken, product);
  createUpdateDeleteAdditionalLabelMetafield(shop, accessToken, product);
};

const createUpdateDeletePriceStringMetafield = async (
  shop,
  accessToken,
  product,
  productUnitPrice
) => {
  if (!product.sellByWeight && product.priceStringMetafieldShopifyId) {
    let res = await deleteShopifyProductMetadata(
      shop,
      accessToken,
      product,
      product.priceStringMetafieldShopifyId
    );
    product.priceStringMetafieldShopifyId = null;
    await updateProduct(product);

    console.log("priceString delete");
    console.log(res);

    return;
  }

  if (!product.sellByWeight) {
    return;
  }

  let priceString = `$${productUnitPrice} ${product.weightUnit}`;

  let metafield = {
    key: "SellByWeightPriceString",
    value: priceString,
    value_type: "string",
    namespace: "global",
  };

  if (!product.priceStringMetafieldShopifyId) {
    let res = await createShopifyProductMetafield(
      shop,
      accessToken,
      product.variantShopifyProductId,
      metafield
    );

    product.priceStringMetafieldShopifyId = res.metafield.id;
    await updateProduct(product);
    console.log("priceString create");
    console.log(res);
  } else {
    metafield.id = product.priceStringMetafieldShopifyId;
    let res = await updateShopifyProductMetadata(
      shop,
      accessToken,
      product.variantShopifyProductId,
      metafield
    );
    console.log("priceString update");
    console.log(res);
  }
};

const createUpdateDeletePriceLabelMetafield = async (
  shop,
  accessToken,
  product
) => {
  if (!product.priceLabel && product.priceLabelMetafieldShopifyId) {
    let res = await deleteShopifyProductMetadata(
      shop,
      accessToken,
      product,
      product.priceLabelMetafieldShopifyId
    );

    product.priceLabelMetafieldShopifyId = null;
    await updateProduct(product);

    console.log("pricelabel delete");
    console.log(res);
    return;
  }

  if (!product.priceLabel) {
    return;
  }

  let metafield = {
    key: "PriceUnit",
    value: product.weightUnit,
    value_type: "string",
    namespace: "global",
  };

  if (!product.priceLabelMetafieldShopifyId) {
    let res = await createShopifyProductMetafield(
      shop,
      accessToken,
      product.variantShopifyProductId,
      metafield
    );

    product.priceLabelMetafieldShopifyId = res.metafield.id;
    await updateProduct(product);

    console.log("pricelabel create");
    console.log(res);
  } else {
    metafield.id = product.priceLabelMetafieldShopifyId;
    let res = await updateShopifyProductMetadata(
      shop,
      accessToken,
      product.variantShopifyProductId,
      metafield
    );

    console.log("pricelabel update");
    console.log(res);
  }
};

const createUpdateDeleteAdditionalLabelMetafield = async (
  shop,
  accessToken,
  product
) => {
  if (!product.additionalLabel && product.additionalLabelMetafieldShopifyId) {
    let res = await deleteShopifyProductMetadata(
      shop,
      accessToken,
      product,
      product.additionalLabelMetafieldShopifyId
    );

    product.additionalLabelMetafieldShopifyId = null;
    await updateProduct(product);

    console.log("add label delete");
    console.log(res);
    return;
  }

  if (!product.additionalLabel) {
    return;
  }

  let metafield = {
    key: "Subtitle",
    value: product.additionalLabel,
    value_type: "string",
    namespace: "global",
  };

  if (!product.additionalLabelMetafieldShopifyId) {
    let res = await createShopifyProductMetafield(
      shop,
      accessToken,
      product.variantShopifyProductId,
      metafield
    );

    product.additionalLabelMetafieldShopifyId = res.metafield.id;
    updateProduct(product);

    console.log("add label create");
    console.log(res);
  } else {
    metafield.id = product.additionalLabelMetafieldShopifyId;
    let res = await updateShopifyProductMetadata(
      shop,
      accessToken,
      product.variantShopifyProductId,
      metafield
    );

    console.log("add label update");
    console.log(res);
  }
};
