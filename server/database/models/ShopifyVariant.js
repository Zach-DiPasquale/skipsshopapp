import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Variant } from "./Variant";

@Entity()
export class ShopifyVariant {
  @PrimaryGeneratedColumn()
  id = undefined;

  @Column({ type: "varchar", nullable: true })
  shopifyVariantId = undefined;

  @Column({ type: "varchar" })
  shopifyProductId = undefined;

  @Column({ type: "int", nullable: true })
  position = undefined;

  @ManyToOne((type) => Variant, {
    cascade: true,
  })
  option1Variant = null;

  @ManyToOne((type) => Variant, {
    cascade: true,
  })
  option2Variant = null;

  @ManyToOne((type) => Variant, {
    cascade: true,
  })
  option3Variant = null;

  @Column({ type: "varchar" })
  toMultiply = 1;

  @Column({ type: "varchar" })
  toAdd = 0;
}
