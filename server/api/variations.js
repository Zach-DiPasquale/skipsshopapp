import Router from "koa-router";

import {
  getProduct,
  createProduct,
  createShopifyVariantProduct,
  updateShopifyProduct,
  getAllVariantsForProductId,
} from "../handlers/db/product";
import {
  VariantGroup,
  VariantGroupType,
} from "../database/models/VariantGroup";
import { createVariantGroup } from "../handlers/db/variant-group";
import {
  createUpdateVariants,
  syncVariants,
  deleteAllShopifyVariants,
} from "../handlers/shopify";

const router = Router();

// GET /api/variants/3
router.get("/:id", async (ctx) => {
  let product = await getAllVariantsForProductId(ctx.params.id);
  if (!product) return (ctx.status = 404);

  ctx.status = 200;
  ctx.body = product;
});

// POST /api/variants
router.post("/", async (ctx) => {
  const body = ctx.request.body;
  const baseProductId = body.baseProductId;
  const sellByWeight = body.sellByWeight;
  const weightUnit = body.weightUnit;
  const variants = body.variants;

  if (variants.length > 3) {
    ctx.body = {
      error: 400,
      message: {
        error: 400,
        message: `Shopify products can have a max of 3 variants. Received ${variants.length}.`,
      },
    };
    ctx.status = 400;
    return;
  }

  let seenSellByWeight = false;
  variants.forEach((v) => {
    if (seenSellByWeight && v.modifierType == VariantGroupType.WEIGHT) {
      ctx.status = 400;
      ctx.body = {
        error: 400,
        message: `The product can only have one variant that has a sell by weight type.`,
      };
      return;
    }
    if (v.modifierType == VariantGroupType.WEIGHT) {
      seenSellByWeight = true;
    }
  });

  if (ctx.status === 400) {
    return;
  }

  let product = await getProduct(baseProductId);

  if (product === undefined) {
    await createProduct(baseProductId);
    product = await getProduct(baseProductId);
  }

  product.sellByWeight = sellByWeight;
  product.weightUnit = weightUnit;

  const { shop, accessToken } = ctx.session;

  if (product.variantShopifyProductId == undefined) {
    let newProduct = await createShopifyVariantProduct(
      shop,
      accessToken,
      baseProductId
    );
    product.variantShopifyProductId = newProduct.id;
  } else {
    console.log(
      "Variant product already exist, skipping creation of new product."
    );
  }

  await updateShopifyProduct(product);

  await deleteAllShopifyVariants(shop, accessToken, baseProductId);

  let variantIdList = [];
  for (let index = 0; index < variants.length; index++) {
    const v = variants[index];

    const variantGroup = new VariantGroup();
    variantGroup.name = v.name;
    variantGroup.modifierType = v.modifierType;
    variantGroup.product = baseProductId;

    variantGroup.id = await createVariantGroup(variantGroup);
    let vl = await createUpdateVariants(v.variants, variantGroup);
    variantIdList.push(...vl);
  }

  let status = await syncVariants(shop, accessToken, baseProductId);
  if (status.error) {
    ctx.status = 400;
    ctx.body = {
      error: 400,
      message:
        "Something went wrong and the variants weren't created in Shopify\n" +
        JSON.stringify(status.message),
    };

    return;
  }

  ctx.status = 200;
  ctx.body = await getAllVariantsForProductId(baseProductId);
});

export default router;
