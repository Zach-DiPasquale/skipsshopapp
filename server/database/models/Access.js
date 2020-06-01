import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity()
export class Access {
  @PrimaryColumn("varchar")
  shop = "";

  @Column("varchar")
  oauthToken = "";
}
