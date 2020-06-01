import "@babel/polyfill";
import dotenv from "dotenv";
import "isomorphic-fetch";
import createShopifyAuth, { verifyRequest } from "@shopify/koa-shopify-auth";
import graphQLProxy, { ApiVersion } from "@shopify/koa-shopify-graphql-proxy";
import Koa from "koa";
import koaBody from "koa-body";
import next from "next";
import Router from "koa-router";
import session from "koa-session";
import * as handlers from "./handlers/index";
import { receiveWebhook } from "@shopify/koa-shopify-webhooks";
import { createConnection } from "typeorm";
import { Access } from "./database/models/Access";

import apiRouter from "./api";
import { autoUpdateVariants } from "./handlers/shopify";

dotenv.config();
const port = parseInt(process.env.PORT, 10) || 8081;
const dev = process.env.NODE_ENV !== "production";
const app = next({
  dev,
});
const handle = app.getRequestHandler();
const { SHOPIFY_API_SECRET, SHOPIFY_API_KEY, SCOPES } = process.env;
app.prepare().then(() => {
  createConnection()
    .then(async (connection) => {
      const server = new Koa();
      const router = new Router();
      const webhook = receiveWebhook({
        secret: SHOPIFY_API_SECRET,
      });
      server.use(
        session(
          {
            sameSite: "none",
            secure: true,
          },
          server
        )
      );
      server.keys = [SHOPIFY_API_SECRET];
      server.use(
        createShopifyAuth({
          apiKey: SHOPIFY_API_KEY,
          secret: SHOPIFY_API_SECRET,
          scopes: [SCOPES],

          async afterAuth(ctx) {
            //Auth token and shop available in session
            //Redirect to shop upon auth
            const { shop, accessToken } = ctx.session;

            if (!["zach-d-test-store.myshopify.com"].contains(shop)) {
              ctx.status = 403;
              return;
            }
            const shopAccess = new Access();
            shopAccess.shop = shop;
            shopAccess.oauthToken = accessToken;
            connection.manager.save(shopAccess);

            await handlers.registerProductUpdate(shop, accessToken);

            ctx.cookies.set("shopOrigin", shop, {
              httpOnly: false,
              secure: true,
              sameSite: "none",
            });
            ctx.redirect("/");
          },
        })
      );

      router.post("/webhooks/products/update", webhook, (ctx) => {
        let webhook = ctx.state.webhook;
        console.log("received webhook: ", webhook);
        if (webhook.topic !== "PRODUCTS_UPDATE") {
          return;
        }
        console.log("passed");
        autoUpdateVariants(webhook.domain, webhook.payload);
      });

      server.use(
        graphQLProxy({
          version: ApiVersion.April20,
        })
      );

      server.use(async (ctx, next) => {
        if (ctx.path.includes("/webhooks")) {
          return await next();
        }
        await koaBody()(ctx, next);
      });
      router.use("/api", apiRouter.routes());

      router.get("*", verifyRequest(), async (ctx) => {
        await handle(ctx.req, ctx.res);
        ctx.respond = false;
        ctx.res.statusCode = 200;
      });

      server.use(router.allowedMethods());
      server.use(router.routes());
      server.listen(port, () => {
        console.log(`> Ready on http://localhost:${port}`);
      });
    })
    .catch((error) => console.log("TypeORM connection error: ", error));
});
