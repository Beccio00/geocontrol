import { Entity, PrimaryColumn, Column, ManyToMany, ManyToOne } from "typeorm";
import { NetworkDAO } from "./NetworkDAO";

@Entity("gateways")
export class GatewayDAO {
    @PrimaryColumn({ nullable: false })
    macAddress: string;

    @Column({ nullable: true })
    name: string;

    @Column({ nullable: true })
    description: string;
    
    @ManyToOne(() => NetworkDAO, (network) => network.gateways)
    network: NetworkDAO;
}