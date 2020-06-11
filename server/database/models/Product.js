import { Entity, PrimaryColumn, Column, OneToMany } from "typeorm";

import { VariantGroup } from "./VariantGroup";

export const UnitType = {
  LB: "lb",
  OZ: "oz",
};

@Entity()
export class Product {
  @PrimaryColumn("varchar")
  baseShopifyProductId = "";

  @Column({ type: "varchar", nullable: true })
  variantShopifyProductId = undefined;

  @Column({ type: "varchar", nullable: true })
  priceStringMetafieldShopifyId = undefined;

  @OneToMany((type) => VariantGroup, (v) => v.product)
  variantGroups = undefined;

  @Column({ type: "boolean", nullable: true })
  sellByWeight = undefined;

  @Column({ type: "boolean", nullable: true })
  priceLabel = undefined;

  @Column({ type: "varchar", nullable: true })
  priceLabelMetafieldShopifyId = undefined;

  @Column({ type: "varchar", length: 50, nullable: true })
  additionalLabel = undefined;

  @Column({ type: "varchar", nullable: true })
  additionalLabelMetafieldShopifyId = undefined;

  @Column({
    type: "enum",
    enum: UnitType,
    default: UnitType.LB,
  })
  weightUnit = undefined;
}
