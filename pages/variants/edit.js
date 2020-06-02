import React, { useState, useCallback, useEffect } from "react";
import {
  Page,
  DisplayText,
  Banner,
  Button,
  Form,
  FormLayout,
  Checkbox,
  TextField,
  Select,
  Stack,
  Card,
  CalloutCard,
  Toast,
  Frame,
} from "@shopify/polaris";
import { DeleteMajorMonotone } from "@shopify/polaris-icons";
import { gql } from "apollo-boost";
import { useQuery } from "@apollo/react-hooks";
import { useRouter } from "next/router";
import fetch from "node-fetch";
import useSWR from "swr";

const GET_PRODUCT = gql`
  query products($query: String!) {
    products(first: 1, query: $query) {
      edges {
        node {
          id
          title
          totalVariants
          variants(first: 1) {
            edges {
              node {
                id
                price
              }
            }
          }
        }
      }
    }
  }
`;

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

function FormOnSubmitExample({ price, productId, product }) {
  const [sellByWeight, setSellByWeight] = useState(false);
  const [unitSelected, setUnitSelected] = useState("LB");
  const [variants, setVariants] = useState(product.variantGroups);

  const [errorToastActive, setErrorToastActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const toggleErrorActive = useCallback(
    () => setErrorToastActive((errorToastActive) => !errorToastActive),
    []
  );

  const toastErrorMarkup = errorToastActive ? (
    <Toast content="Unsuccessful" error onDismiss={toggleErrorActive} />
  ) : null;

  const [successToastActive, setSuccessToastActive] = useState(false);

  const toggleSuccessActive = useCallback(
    () => setSuccessToastActive((successToastActive) => !successToastActive),
    []
  );

  const toastSuccessMarkup = successToastActive ? (
    <Toast content="Success" onDismiss={toggleSuccessActive} />
  ) : null;

  const handleUnitSelectChange = useCallback(
    (value) => setUnitSelected(value),
    []
  );

  const handleSellByWeightChange = useCallback(
    (value) => setSellByWeight(value),
    []
  );

  const handleVariantSelectChange = (index, value) => {
    const updatedVariant = variants[index];
    updatedVariant.modifierType = value;
    updateVariant(index, updatedVariant);
  };

  const handleSubmit = () => {
    const body = {
      baseProductId: productId,
      sellByWeight: sellByWeight,
      unit: unitSelected,
      variants: variants,
    };
    setErrorMessage("");
    fetch("https://shop-skips-meat-market.myshopify.com/api/variants", {
      method: "POST",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => {
        if (!res.ok) {
          toggleErrorActive();
        }
        return res.json();
      })
      .then((json) => {
        if (json.error) {
          setErrorMessage(json.message);
        } else {
          toggleSuccessActive();
        }
      });
  };

  const unitOptions = [
    { label: "lb.", value: "LB" },
    { label: "oz.", value: "OZ" },
  ];

  const variantOptions = [
    { label: "Modify price based on oz.", value: "WEIGHT" },
    { label: "Add a flat fee", value: "FEE" },
    { label: "No extra charge", value: "NONE" },
  ];

  const getTypeOptions = (index) => {
    if (index === 0) {
      return variantOptions;
    }
    return variantOptions.filter((a) => a.value !== "WEIGHT");
  };

  const addVariantGroup = () => {
    setVariants([
      ...variants,
      {
        name: "",
        id: null,
        modifierType: variants.length === 0 ? "WEIGHT" : "FEE",
        variants: [{ label: "", modifierValue: "" }],
        checked: "",
      },
    ]);
  };

  const removeVariantGroup = (i) => {
    const newVariants = [...variants];
    newVariants.splice(i, 1);
    setVariants(newVariants);
  };

  const updateVariant = (index, updatedVariant) => {
    const newVariants = [...variants];
    newVariants[index] = updatedVariant;
    setVariants(newVariants);
  };

  const addVariantOption = (index) => {
    const newVariants = [...variants];
    const newVariant = newVariants[index];
    newVariant.variants.push({
      label: "",
      modifierValue: undefined,
    });
    updateVariant(index, newVariant);
  };

  const removeOption = (index, i) => {
    const newVariants = [...variants];
    const newVariant = newVariants[index];
    newVariant.variants.splice(i, 1);
    updateVariant(index, newVariant);
  };

  const updateOption = (index, i, updatedOption) => {
    const newVariants = [...variants];
    const newVariant = newVariants[index];
    newVariant.variants[i] = updatedOption;
    updateVariant(index, newVariant);
  };

  return (
    <div>
      {errorMessage ? (
        <Banner title="Error" status="critical">
          <p>{errorMessage}</p>
        </Banner>
      ) : (
        <></>
      )}

      <Form>
        <FormLayout>
          <Card title="General" sectioned>
            <Checkbox
              label="Mark this product as 'Sell by Weight'"
              checked={sellByWeight}
              onChange={handleSellByWeightChange}
              helpText={
                <span>
                  We'll use this to show to the customer the price per unit.
                </span>
              }
            />
            {sellByWeight ? (
              <Select
                label="Unit"
                options={unitOptions}
                onChange={handleUnitSelectChange}
                value={unitSelected}
                helpText={
                  <span>
                    This is the unit that we'll use to display to the customer.
                  </span>
                }
              />
            ) : (
              <></>
            )}
          </Card>
          <Card
            title="Variants"
            actions={[
              {
                content: "Add Variant Group",
                onAction: addVariantGroup,
                disabled: variants.length >= 3,
              },
            ]}
            sectioned
          >
            {variants.length >= 1 ? (
              variants.map((variant, index) => {
                return (
                  <Card.Section
                    title={"Variant"}
                    actions={[
                      {
                        content: "Remove",
                        onAction: () => removeVariantGroup(index),
                        disabled: variants.length <= 1,
                      },
                    ]}
                  >
                    <FormLayout.Group condensed>
                      <TextField
                        value={variant.name}
                        onChange={(newValue) => {
                          variant.name = newValue;
                          updateVariant(index, variant);
                        }}
                        label="Variant Group Name"
                        modifierType="text"
                        helpText={
                          <span>
                            This is displayed to the customer to help them
                            determine what they are selected a variant for.
                          </span>
                        }
                      />
                      <Select
                        label="Type"
                        options={getTypeOptions(index)}
                        onChange={(value) =>
                          handleVariantSelectChange(index, value)
                        }
                        value={variant.modifierType}
                        helpText={
                          <span>
                            Used to determine how each variant will affect the
                            price.
                          </span>
                        }
                      />
                    </FormLayout.Group>
                    <Card.Section
                      title={"Options"}
                      actions={[
                        {
                          content: "Add Option",
                          onAction: () => addVariantOption(index),
                          disabled: variant.variants.length >= 10,
                        },
                      ]}
                    >
                      {variant.variants.map((o, i) => {
                        return (
                          <Card.Section>
                            <Stack
                              wrap={false}
                              alignment="leading"
                              spacing="loose"
                            >
                              <Stack.Item fill>
                                <FormLayout>
                                  <FormLayout.Group>
                                    <TextField
                                      value={o.label}
                                      onChange={(newValue) => {
                                        o.label = newValue;
                                        updateOption(index, i, o);
                                      }}
                                      type="text"
                                      placeholder="3/4 inch"
                                    />
                                    <div>
                                      {variant.modifierType === "WEIGHT" ? (
                                        <TextField
                                          value={o.modifierValue}
                                          onChange={(newValue) => {
                                            o.modifierValue = newValue;
                                            updateOption(index, i, o);
                                          }}
                                          type="number"
                                          placeholder="Weight in oz."
                                          suffix="oz."
                                        />
                                      ) : (
                                        <></>
                                      )}
                                      {variant.modifierType === "FEE" ? (
                                        <TextField
                                          value={o.modifierValue}
                                          onChange={(newValue) => {
                                            o.modifierValue = newValue;
                                            updateOption(index, i, o);
                                          }}
                                          type="text"
                                          placeholder="2.00"
                                          prefix="$"
                                          onBlur={() => {
                                            o.modifierValue = (
                                              Math.round(
                                                (o.modifierValue * 1 +
                                                  Number.EPSILON) *
                                                  1000
                                              ) / 1000
                                            ).toFixed(2);
                                            updateOption(index, i, o);
                                          }}
                                        />
                                      ) : (
                                        <></>
                                      )}
                                    </div>
                                  </FormLayout.Group>
                                </FormLayout>
                              </Stack.Item>
                              <Button
                                icon={DeleteMajorMonotone}
                                accessibilityLabel="Remove item"
                                onClick={() => removeOption(index, i)}
                                disabled={variant.variants.length === 1}
                              />
                            </Stack>
                            {o.modifierValue > 0 &&
                            variant.modifierType === "WEIGHT" ? (
                              <p>
                                Preview: {o.label ? o.label : "3/4 inch"} (~
                                {o.modifierValue}
                                oz.) is $
                                {(
                                  Math.round(
                                    (price * (o.modifierValue / 16) +
                                      Number.EPSILON) *
                                      100
                                  ) / 100
                                ).toFixed(2)}
                              </p>
                            ) : (
                              <></>
                            )}
                            {o.modifierValue > 0 &&
                            variant.modifierType === "FEE" ? (
                              <p>
                                Preview: {o.label ? o.label : "3/4 inch"} has a
                                $
                                {(
                                  Math.round(
                                    (o.modifierValue * 1 + Number.EPSILON) * 100
                                  ) / 100
                                ).toFixed(2)}{" "}
                                fee
                              </p>
                            ) : (
                              <></>
                            )}
                          </Card.Section>
                        );
                      })}
                    </Card.Section>
                  </Card.Section>
                );
              })
            ) : (
              <CalloutCard
                title="Add a Variant!"
                illustration="https://cdn.shopify.com/s/assets/admin/checkout/settings-customizecart-705f57c725ac05be5a34ec20c05b94298cb8afd10aac7bd9c7ad02030f48cfa0.svg"
                primaryAction={{
                  content: "Add Variant",
                  onAction: addVariantGroup,
                }}
              >
                <p>
                  This product doesn't have any variants. Add one to get
                  started.
                </p>
              </CalloutCard>
            )}
          </Card>
          <Button primary onClick={handleSubmit}>
            Save
          </Button>
        </FormLayout>
        {toastErrorMarkup}
        {toastSuccessMarkup}
      </Form>
    </div>
  );
}

const VariantEdit = () => {
  const router = useRouter();
  const productId = router.query.id;
  const shop = router.query.shop;

  const { loading, error, data } = useQuery(GET_PRODUCT, {
    variables: { query: `${productId}` },
  });

  const { data: product, APIerror } = useSWR(
    "https://shop-skips-meat-market.myshopify.com/api/variants/" + productId,
    fetcher
  );

  if (APIerror) return <div>failed to load</div>;
  if (!product) return "Loading Product Variant Data";

  if (error) return `Error! ${error.message}`;
  if (loading) return "Loading...";

  const shopifyProduct = data.products.edges[0].node;

  if (shopifyProduct.totalVariants > 1) {
    return (
      <Banner title="Invalid Product" status="critical">
        <p>
          The product cannot have more than one variant to use this feature.
        </p>
        <br />
        <p>
          <strong>{shopifyProduct.title}</strong> has{" "}
          <strong>{shopifyProduct.totalVariants}</strong> variants. You need to
          use Revel POS products with this app. Products that have variants from
          this app will have a "RevelSourceProduct" tag.
          <br />
          To use this feature, remove all variants from this product on the
          Shopify Product page.
        </p>
      </Banner>
    );
  }

  return (
    <Frame>
      <Page>
        <DisplayText size="large">
          {shopifyProduct.title.split("AUTOMATIC (DO NOT TOUCH) ")}
        </DisplayText>
        {product.variantShopifyProductId ? (
          <div>
            <a
              href={`https://${shop}/admin/products/${product.variantShopifyProductId}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Go to product
            </a>
            <br />
          </div>
        ) : (
          <></>
        )}

        <br />
        <p>
          <strong>Price:</strong> {shopifyProduct.variants.edges[0].node.price}
        </p>
        <br />
        <FormOnSubmitExample
          price={shopifyProduct.variants.edges[0].node.price}
          productId={productId}
          product={product}
        />
      </Page>
    </Frame>
  );
};

const Index = () => <Page>{VariantEdit()}</Page>;

export default Index;
