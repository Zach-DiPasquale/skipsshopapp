import React, { useState, useCallback, useEffect } from "react";
import { Page } from "@shopify/polaris";
import Router, { useRouter } from "next/router";
import fetch from "node-fetch";
import useSWR from "swr";

const fetcher = async (path) => {
  return fetch(path)
    .then((res) => {
      if (res.status === 404) {
        return [];
      }
      if (!res.ok) {
        throw Error(res.statusText);
      }
      return res.json();
    })
    .then((json) => json)
    .catch(() => {
      console.warn(`Something went wrong when creating a product ${e}`);
    });
};

const Route = () => {
  const router = useRouter();
  const productId = router.query.id;
  const shop = router.query.shop;

  const { data: product, APIerror } = useSWR(
    "https://232866b86a0b.ngrok.io/api/variants/" + productId,
    fetcher
  );

  if (APIerror) return <div>failed to load</div>;
  if (!product) return "Redirecting...";

  // Router.replace(
  //   `https://${shop}/admin/products/${product.variantShopifyProductId}`
  // );
  window.location.replace(
    `https://${shop}/admin/products/${product.variantShopifyProductId}`
  );

  return <div>Redirecting...</div>;
};

const Index = () => <Page>{Route()}</Page>;

export default Index;
