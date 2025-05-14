import { Entity, PrimaryColumn, Column, OneToMany } from "typeorm";
import { GatewayDAO as Gateway } from "@dao/GatewayDAO";
@Entity("networks")
export class NetworkDAO {
    @PrimaryColumn({ nullable: false })
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
