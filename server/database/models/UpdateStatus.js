import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { VariantGroup } from "./VariantGroup";

export const Status = {
  SUCCESS: "SUCCESS",
  FAILURE: "FAILURE",
  IN_PROGRESS: "IN_PROGRESS",
};

@Entity()
export class UpdateStatus {
  @PrimaryGeneratedColumn()
  id = undefined;

  @Column({
    type: "enum",
    enum: Status,
    default: Status.IN_PROGRESS,
  })
  status = undefined;

  @Column({
    type: "enum",
    enum: Status,
    nullable: true,
  })
  metafieldStatus = undefined;

  @Column({ type: "varchar", nullable: true })
  productName = "";

  @Column({ type: "varchar", nullable: true })
  message = "";

  @CreateDateColumn({ type: "timestamptz" })
  startingTime;

  @UpdateDateColumn({ type: "timestamptz" })
  completionTime;
}
