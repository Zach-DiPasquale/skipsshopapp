import { Heading, Page, CalloutCard } from "@shopify/polaris";

const Index = () => (
  <Page>
    <Heading>Skip's Shop App</Heading>
    <CalloutCard
      title="Product Variations"
      illustration="https://cdn.shopify.com/s/assets/admin/checkout/settings-customizecart-705f57c725ac05be5a34ec20c05b94298cb8afd10aac7bd9c7ad02030f48cfa0.svg"
      primaryAction={{
        content: "Add/Edit Variations",
        // url: "/variations",
      }}
    >
      <p>Add or edit variations to Revel products.</p>
    </CalloutCard>
    <CalloutCard
      title="Orders and Metrics (Coming soon)"
      illustration="https://cdn.shopify.com/s/assets/admin/checkout/settings-customizecart-705f57c725ac05be5a34ec20c05b94298cb8afd10aac7bd9c7ad02030f48cfa0.svg"
      primaryAction={{
        content: "View Orders",
        url: "/orders",
      }}
    >
      <p>View orders and metrics.</p>
    </CalloutCard>
  </Page>
);

export default Index;
