import React, { useState, useCallback } from "react";
import { Heading, Page, Autocomplete, Icon } from "@shopify/polaris";
import { SearchMinor } from "@shopify/polaris-icons";
import { gql } from "apollo-boost";
import { useQuery } from "@apollo/react-hooks";

const SEARCH_PRODUCTS = gql`
  query products($query: String!) {
    products(first: 5, query: $query) {
      edges {
        node {
          id
          title
        }
      }
    }
  }
`;

const formatData = (data) => {
  const options = data.products.edges.map((p) => {
    return { value: p.node.id, label: p.node.title };
  });
  return options;
};

const search = (query) => {
  const { loading, error, data } = useQuery(SEARCH_PRODUCTS, {
    variables: { query },
  });
  return data;
};

function productSearch() {
  const deselectedOptions = [];
  const [selectedOptionsId, setSelectedOptionsId] = useState("");
  const [inputValue, setInputValue] = useState("");

  const { loading, error, data } = useQuery(SEARCH_PRODUCTS, {
    variables: { query: inputValue },
  });

  let options = [];
  if (!loading) {
    options = formatData(data);
  }

  const updateText = useCallback((value) => {
    setInputValue(value);
  });

  const updateSelection = useCallback((selected) => {
    setSelectedOptions(selected);
  }, []);

  const textField = (
    <Autocomplete.TextField
      onChange={updateText}
      label="Products"
      value={inputValue}
      prefix={<Icon source={SearchMinor} color="inkLighter" />}
      placeholder="Search"
    />
  );

  return (
    <div style={{ height: "225px" }}>
      <Autocomplete
        options={options}
        onSelect={updateSelection}
        textField={textField}
      />
    </div>
  );
}

const Index = () => (
  <Page>
    <Heading>Variations</Heading>
    <p>Begin by searching for a product to add or edit variations.</p>
    {productSearch()}
  </Page>
);

export default Index;

// {
//   products(first: 5, query:"Product") {
//     edges {
//       node {
//         id
//         title
//       }
//     }
//   }
// }
