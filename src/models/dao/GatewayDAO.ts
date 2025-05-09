import { Entity, PrimaryColumn, Column, OneToMany, ManyToOne } from "typeorm";
import { SensorDAO } from "@dao/SensorDAO";
import { NetworkDAO } from "@dao/NetworkDAO";

@Entity("gateways")
export class GatewayDAO {
  @PrimaryColumn({ nullable: false })
  macAddress: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  description: string;

  @OneToMany(() => SensorDAO, (sensor) => sensor.gateway, {
    cascade: true,
    eager: true, // Optional: auto-load sensors with gateways
  })
  sensors: SensorDAO[];

  // FIXME: this is a workaround for the many-to-one relationship with NetworkDAO

  @ManyToOne(() => Network, (network) => network.gateways, { nullable: false })
  @JoinColumn({ name: "networkId" }) // foreign key name ??? FIXME
  network: NetworkDAO;

}