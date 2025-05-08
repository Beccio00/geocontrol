import { Entity, PrimaryColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { NetworkDAO as Network } from '@dao/NetworkDAO';
import { SensorDAO as Sensor } from "@dao/SensorDAO";

@Entity()
export class GatewayDAO {
  @PrimaryColumn()
  macAddress: string;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  description: string;

  @ManyToOne(() => Network, network => network.gateways)
  @JoinColumn({ name: 'networkCode' })
  network: Network;

  @OneToMany(() => Sensor, sensor => sensor.gateway)
  sensors: Sensor[];
}