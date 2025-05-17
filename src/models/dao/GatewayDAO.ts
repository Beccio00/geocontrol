import { Entity, PrimaryColumn, Column, ManyToOne, OneToMany, JoinColumn, Unique, PrimaryGeneratedColumn } from 'typeorm';
import { NetworkDAO as Network } from '@dao/NetworkDAO';
import { SensorDAO as Sensor } from "@dao/SensorDAO";

@Entity("gateways")
@Unique(["macAddress"])
export class GatewayDAO {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  macAddress: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  description: string;

  @ManyToOne(() => Network, network => network.gateways,{      
      onDelete:"CASCADE",
      onUpdate:"CASCADE"
  })
  @JoinColumn({ name: 'networkId' })
  network: Network;

  @OneToMany(() => Sensor, sensor => sensor.gateway, {
    eager:true,
    onDelete:"CASCADE",
    onUpdate:"CASCADE" 
  })
  sensors: Sensor[];
}