import { Entity, PrimaryColumn, Column, OneToMany } from "typeorm";
// import { SensorDAO } from "./SensorDAO";

@Entity("gateways")
export class GatewayDAO {
  @PrimaryColumn({ nullable: false })
  macAddress: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  description: string;
/*
  @OneToMany(() => SensorDAO, (sensor) => sensor.gateway, {
    cascade: true,
    eager: true, // Optional: auto-load sensors with gateways
  })
  sensors: SensorDAO[];
*/
}