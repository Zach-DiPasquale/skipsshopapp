import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { VariantGroup } from "./VariantGroup";

export const ModifierDirection = {
  POSITIVE: "POSITIVE",
  NEGATIVE: "NEGATIVE",
};

@Entity()
export class Variant {
  @PrimaryGeneratedColumn()
  id = undefined;

  @Column("varchar")
  label = "";

  @Column({ type: "decimal", nullable: true })
  modifierValue = undefined;

  @ManyToOne((type) => VariantGroup, (v) => v.variants)
  variantGroup = undefined;
}
