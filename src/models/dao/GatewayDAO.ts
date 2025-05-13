import { Entity, PrimaryColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { NetworkDAO as Network } from '@dao/NetworkDAO';
import { SensorDAO as Sensor } from "@dao/SensorDAO";

@Entity("gateways")
export class GatewayDAO {
  @PrimaryColumn()
  macAddress: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  description: string;

  @ManyToOne(() => Network, network => network.gateways,{      
      onDelete:"CASCADE",
      onUpdate:"CASCADE"
  })
  @JoinColumn({ name: 'networkCode' })
  network: Network;

  @OneToMany(() => Sensor, sensor => sensor.gateway, {
    eager:true,
    onDelete:"CASCADE",
    onUpdate:"CASCADE" 
  })
  sensors: Sensor[];
}