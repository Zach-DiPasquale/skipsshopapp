# Skip's Store App

![Node.js CI](https://github.com/Zach-DiPasquale/skipsshopapp/workflows/Node.js%20CI/badge.svg)

This app is a propriety custom Shopify app designed to meet the unique needs of [https://shop-skips-meat-market.myshopify.com/](https://shop-skips-meat-market.myshopify.com/). You may not use commercially without express writen consent. Copyright 2021 Zachary DiPasquale.

This custom Shopify app give the ability to sell weighted items on a Shopify store front. Skip's Meat Market offers a
wide range of meat products in store. Each item has many customizations and can be cut, trimmed, chopped, or sliced
for no additional charges. We wanted to bring that same functionality to users on an online store in an easy to use
and functional product.

## How does it work?

Products are imported into Shopify using a integration with POS software and Shopify. Prices are automatically updated
by that integration on regular intervals. Most of these items are sold by weight. Shopify does not have a concept of
sold by weight, so this app give the ability to sell each of those products by weight. Once all the items are imported
into shopify, this app allows you to add additional configuration sell the product how you want to. When additional
configuration is added to a product, in most situations, it will hide the original source product from your Shopify
store front and create a new one to match the configuration. This allows the POS integration to continue to update that
source products price. When a price update occurs on one of those products, a webhook is received and the app will then
update the product pricing on all variants of the visible product.

## What can be updated?

![Image 1](/img/ProductImage1.png)

- Add additional labels to ensure product is displayed correctly with "/ lbs." if necessary (using Shopify Product Meta tags)
- Whether the product is sold by oz. or lbs.
- A product subtitle (using Shopify Product Meta tags)

There are three different type of variants that can be added to ensure product is displayed appropriately by weight

### Sold in whole pound increments

![Image 2](/img/ProductImage2.png)

For example may chicken products are like this, because most people by them in pound increments, and it is easy to match
the desired weight of the customer without much work

### Sold by wight, but not in pound increments

![Image 3](/img/ProductImage2.png)

For example most steaks are not sold in 1lb increments, instead sold by steak. In order to achieve this, custom variants
are created, with a modification by oz. Adding a name and the weight of each variant, the system automatically calculates
the appropriate price for each variant. When the price is updated on the source product, each variant will also update.

### Additional price variants

The third option is additional price variants, like when it might cost more to get your product seasoned.

## Built with Shopify CLI

This custom Shopify app was built using the Shopify CLI [boilerplate](https://github.com/Shopify/shopify-app-node). All boilerplate remains under its respective license.

To run this yourself, you must also have a shopify developer account which can be created [here](https://shopify.dev/).

## Requirements

- [Shopify CLI](https://shopify.dev/apps/tools/cli)
- Shopify developer account and test store
- PostgreSQL
- node.js

## Setup

- Update `ormconfig.js` with appropriate PostgreSQL connection string for created db'
- run `npm install`

## Run

use `shopify serve` (will ask for API credentials)

## Tests

run `npm test`

## Deploy to Heroku

pushing changes to master will deploy build.
