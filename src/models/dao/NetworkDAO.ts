import { Entity, PrimaryColumn, Column, OneToMany, Unique, PrimaryGeneratedColumn } from "typeorm";
import { GatewayDAO as Gateway } from "@dao/GatewayDAO";

@Entity("networks")
@Unique(["code"])
export class NetworkDAO {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false })
    code: string;

    @Column({ nullable: true })
    name: string;

    @Column({ nullable: true })
    description: string;

    @OneToMany(() => Gateway, gateway => gateway.network,{
        eager:true,
        onDelete:"CASCADE",
        onUpdate:"CASCADE"
    })
    gateways: Gateway[];
}
