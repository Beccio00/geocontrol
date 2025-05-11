import { Entity, PrimaryColumn, Column, ManyToOne, OneToMany, JoinColumn } from "typeorm";
import { GatewayDAO as Gateway } from "@dao/GatewayDAO";
import { NetworkDAO as Network } from "@dao/NetworkDAO";
import { MeasurementDAO } from "@dao/MeasurementDAO";

@Entity("sensors")
export class SensorDAO {
  @PrimaryColumn({ nullable: false })
  macAddress: string;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  description: string;

  @Column({ nullable: false })
  variable: string;

  @Column({ nullable: false })
  unit: string; 

  @ManyToOne(() => Gateway, gateway => gateway.sensors)
  @JoinColumn({ name: 'gatewayMac' })
  gateway: Gateway;

  @OneToMany(() => MeasurementDAO, (measurement) => measurement.sensor, {
    cascade: true,
    eager: false, 
  })
  measurements: MeasurementDAO[];
}




