import { Entity, PrimaryColumn, Column, OneToMany } from "typeorm";
import { GatewayDAO as Gateway } from "@dao/GatewayDAO";
@Entity("networks")
export class NetworkDAO {
    @PrimaryColumn({ nullable: false })
    code: string;

    @Column({ nullable: false })
    name: string;

    @Column({ nullable: false })
    description: string;

    @OneToMany(() => Gateway, gateway => gateway.network)
    gateways: Gateway[];
}
