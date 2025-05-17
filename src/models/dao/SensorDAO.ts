import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn, Unique, PrimaryGeneratedColumn } from "typeorm";
import { GatewayDAO as Gateway } from "@dao/GatewayDAO";
import { NetworkDAO as Network } from "@dao/NetworkDAO";

@Entity("sensors")
@Unique(["macAddress"])
export class SensorDAO {
  @PrimaryGeneratedColumn()
  id: number; 

  @Column({ nullable: false })
  macAddress: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  variable: string;

  @Column({ nullable: true })
  unit: string; 

  @ManyToOne(() => Gateway, gateway => gateway.sensors, {      
      onDelete:"CASCADE",
      onUpdate:"CASCADE"
  })
  @JoinColumn({ name: 'gatewayId' })
  gateway: Gateway;
}




