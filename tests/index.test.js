const { VariantGroupType } = require("../server/database/models/VariantGroup");
const {
  createVariantCombos,
  sortVariantGroups,
} = require("../server/handlers/shopify");

test("One variant group by WEIGHT", () => {
  let variants = createVariantCombos(
    [
      {
        id: 1,
        label: "Test1",
        modifierValue: 8,
      },
      {
        id: 2,
        label: "Test2",
        modifierValue: 16,
      },
    ],
    [],
    [],
    [
      {
        modifierType: VariantGroupType.WEIGHT,
      },
    ],
    5,
    false,
    1
  );

  expect(variants.length).toBe(2);
  expect(variants[0].price).toBe(2.5);
  expect(variants[1].price).toBe(5);
});

test("One variant group by FEE", () => {
  let variants = createVariantCombos(
    [
      {
        id: 1,
        label: "Test1",
        modifierValue: 0,
      },
      {
        id: 2,
        label: "Test2",
        modifierValue: 2,
      },
    ],
    [],
    [],
    [
      {
        modifierType: VariantGroupType.FEE,
      },
    ],
    5,
    false,
    1
  );

  expect(variants.length).toBe(2);
  expect(variants[0].price).toBe(5);
  expect(variants[1].price).toBe(7);
});

test("One variant group by NONE", () => {
  let variants = createVariantCombos(
    [
      {
        id: 1,
        label: "Test1",
        modifierValue: 0,
      },
      {
        id: 2,
        label: "Test2",
        modifierValue: 2,
      },
    ],
    [],
    [],
    [
      {
        modifierType: VariantGroupType.NONE,
      },
    ],
    5,
    false,
    1
  );

  expect(variants.length).toBe(2);
  expect(variants[0].price).toBe(5);
  expect(variants[1].price).toBe(5);
});

test("Two variant group by WEIGHT and FEE", () => {
  let variants = createVariantCombos(
    [
      {
        id: 1,
        label: "Test1",
        modifierValue: 8,
      },
      {
        id: 2,
        label: "Test2",
        modifierValue: 16,
      },
    ],
    [
      {
        id: 3,
        label: "Test3",
        modifierValue: 0,
      },
      {
        id: 4,
        label: "Test4",
        modifierValue: 2,
      },
    ],
    [],
    [
      {
        modifierType: VariantGroupType.WEIGHT,
      },
      {
        modifierType: VariantGroupType.FEE,
      },
    ],
    5,
    false,
    1
  );

  expect(variants.length).toBe(4);
  let variant1 = variants[0];
  expect(variant1.price).toBe(2.5);
  expect(variant1.option1Variant).toBe(1);
  expect(variant1.option2Variant).toBe(3);
  expect(variant1.toAdd).toBe(0);
  expect(variant1.toMultiply).toBe(0.5);

  let variant2 = variants[1];
  expect(variant2.price).toBe(5);
  expect(variant2.option1Variant).toBe(2);
  expect(variant2.option2Variant).toBe(3);
  expect(variant2.toAdd).toBe(0);
  expect(variant2.toMultiply).toBe(1);

  let variant3 = variants[2];
  expect(variant3.price).toBe(4.5);
  expect(variant3.option1Variant).toBe(1);
  expect(variant3.option2Variant).toBe(4);
  expect(variant3.toAdd).toBe(2);
  expect(variant3.toMultiply).toBe(0.5);

  let variant4 = variants[3];
  expect(variant4.price).toBe(7);
  expect(variant4.option1Variant).toBe(2);
  expect(variant4.option2Variant).toBe(4);
  expect(variant4.toAdd).toBe(2);
  expect(variant4.toMultiply).toBe(1);
});

test("Three variant group by WEIGHT > FEE > NONE", () => {
  let variants = createVariantCombos(
    [
      {
        id: 1,
        label: "Test1",
        modifierValue: 8,
      },
      {
        id: 2,
        label: "Test2",
        modifierValue: 16,
      },
    ],
    [
      {
        id: 3,
        label: "Test3",
        modifierValue: 0,
      },
      {
        id: 4,
        label: "Test4",
        modifierValue: 2,
      },
    ],
    [
      {
        id: 5,
        label: "Test3",
        modifierValue: 3,
      },
      {
        id: 6,
        label: "Test4",
        modifierValue: 2,
      },
    ],
    [
      {
        modifierType: VariantGroupType.WEIGHT,
      },
      {
        modifierType: VariantGroupType.FEE,
      },
      {
        modifierType: VariantGroupType.NONE,
      },
    ],
    5,
    false,
    1
  );

  expect(variants.length).toBe(8);
  let variant1 = variants[0];
  expect(variant1.price).toBe(2.5);
  expect(variant1.option1Variant).toBe(1);
  expect(variant1.option2Variant).toBe(3);
  expect(variant1.option3Variant).toBe(5);
  expect(variant1.toAdd).toBe(0);
  expect(variant1.toMultiply).toBe(0.5);

  let variant2 = variants[1];
  expect(variant2.price).toBe(5);
  expect(variant2.option1Variant).toBe(2);
  expect(variant2.option2Variant).toBe(3);
  expect(variant2.option3Variant).toBe(5);
  expect(variant2.toAdd).toBe(0);
  expect(variant2.toMultiply).toBe(1);

  let variant3 = variants[2];
  expect(variant3.price).toBe(4.5);
  expect(variant3.option1Variant).toBe(1);
  expect(variant3.option2Variant).toBe(4);
  expect(variant3.option3Variant).toBe(5);
  expect(variant3.toAdd).toBe(2);
  expect(variant3.toMultiply).toBe(0.5);

  let variant4 = variants[3];
  expect(variant4.price).toBe(7);
  expect(variant4.option1Variant).toBe(2);
  expect(variant4.option2Variant).toBe(4);
  expect(variant4.option3Variant).toBe(5);
  expect(variant4.toAdd).toBe(2);
  expect(variant4.toMultiply).toBe(1);

  let variant5 = variants[4];
  expect(variant5.price).toBe(2.5);
  expect(variant5.option1Variant).toBe(1);
  expect(variant5.option2Variant).toBe(3);
  expect(variant5.option3Variant).toBe(6);
  expect(variant5.toAdd).toBe(0);
  expect(variant5.toMultiply).toBe(0.5);

  let variant6 = variants[5];
  expect(variant6.price).toBe(5);
  expect(variant6.option1Variant).toBe(2);
  expect(variant6.option2Variant).toBe(3);
  expect(variant6.option3Variant).toBe(6);
  expect(variant6.toAdd).toBe(0);
  expect(variant6.toMultiply).toBe(1);

  let variant7 = variants[6];
  expect(variant7.price).toBe(4.5);
  expect(variant7.option1Variant).toBe(1);
  expect(variant7.option2Variant).toBe(4);
  expect(variant7.option3Variant).toBe(6);
  expect(variant7.toAdd).toBe(2);
  expect(variant7.toMultiply).toBe(0.5);

  let variant8 = variants[7];
  expect(variant8.price).toBe(7);
  expect(variant8.option1Variant).toBe(2);
  expect(variant8.option2Variant).toBe(4);
  expect(variant8.option3Variant).toBe(6);
  expect(variant8.toAdd).toBe(2);
  expect(variant8.toMultiply).toBe(1);
});

test("Sort variants puts WEIGHT First", () => {
  let result = sortVariantGroups([
    { modifierType: VariantGroupType.FEE },
    { modifierType: VariantGroupType.NONE },
    { modifierType: VariantGroupType.WEIGHT },
  ]);

  expect(result[0].modifierType).toBe(VariantGroupType.WEIGHT);
  expect(result[1].modifierType).toBe(VariantGroupType.FEE);
});
