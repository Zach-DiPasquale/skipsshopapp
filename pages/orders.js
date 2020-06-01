import { Page, EmptyState } from "@shopify/polaris";

const Index = () => (
  <Page>
    <EmptyState
      heading="Orders and Metrics"
      action={{ content: "Add transfer" }}
      image="https://cdn.shopify.com/s/files/1/0757/9955/files/empty-state.svg"
    >
      <p>
        I plan to add a better way we could manage order here. Hopefully, to
        simplify the workflow and only provide the information we need. I can
        also possibly include information that is not available on the normal
        order page.
      </p>
    </EmptyState>
  </Page>
);

export default Index;
