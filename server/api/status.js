import Router from "koa-router";
import { getFailuresSince } from "../handlers/db/status";

const router = Router();

router.get("/ping", (ctx) => {
  if (ctx.headers.authorization != "Bearer: e)/yt5d=^&NZ+j~4_N") {
    ctx.body = "Not Found";
    ctx.response.status = 404;
    return;
  }
  ctx.body = "online";
  ctx.response.status = 200;
});

router.get("/check", async (ctx) => {
  if (ctx.headers.authorization != "Bearer: e)/yt5d=^&NZ+j~4_N") {
    ctx.body = "Not Found";
    ctx.response.status = 404;
    return;
  }
  var d = Date.now() - 60 * 60 * 10 * 10 * 10; // check last hour
  let date = new Date(d);
  let isoDate = date.toISOString();
  let failures = await getFailuresSince(isoDate);
  ctx.body = {
    failureCount: failures.length,
    checkedSince: isoDate,
    failures: [],
  };
  if (failures.length == 0) {
    ctx.response.status = 200;
  } else {
    ctx.body.failures = failures;
    ctx.response.status = 400;
  }
});

export default router;
