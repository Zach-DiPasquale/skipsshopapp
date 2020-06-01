import {
  Entity,
  PrimaryColumn,
  Column,
  OneToMany,
  JoinTable,
  ManyToOne,
} from "typeorm";

import { VariantGroup } from "./VariantGroup";

@Entity()
export class Product {
  @PrimaryColumn("varchar")
  baseShopifyProductId = "";

  @Column({ type: "varchar", nullable: true })
  variantShopifyProductId = undefined;

  @OneToMany((type) => VariantGroup, (v) => v.product)
  variantGroups = undefined;
}
