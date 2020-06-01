import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  JoinTable,
  ManyToOne,
} from "typeorm";
import { Product } from "./Product";
import { Variant } from "./Variant";

export const VariantGroupType = {
  WEIGHT: "WEIGHT",
  FEE: "FEE",
  NONE: "NONE",
};

@Entity()
export class VariantGroup {
  @PrimaryGeneratedColumn()
  id = undefined;

  @Column({ type: "varchar" })
  name = "";

  @Column({
    type: "enum",
    enum: VariantGroupType,
    default: VariantGroupType.WEIGHT,
  })
  modifierType = undefined;

  @ManyToOne((type) => Product, (p) => p.variantGroups)
  product = undefined;

  @OneToMany((type) => Variant, (v) => v.variantGroup, { cascade: true })
  variants = undefined;
}
