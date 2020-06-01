import Router from "koa-router";

import variationsRouter from "./variations";
import productsRouter from "./products";

const router = Router();

router.use("/variants", variationsRouter.routes());
router.use("/products", productsRouter.routes());

export default router;
