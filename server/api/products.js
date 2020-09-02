import Router from "koa-router";
const router = Router();

router.get("/test", (ctx) => {
  ctx.body = "hello";
  ctx.response.status = 200;
});

export default router;
