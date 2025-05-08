import { AppDataSource } from "@database";
import { Repository } from "typeorm";
import { NetworkDAO } from "@dao/NetworkDAO";
import { UserType } from "@models/UserType";
import { findOrThrowNotFound, throwConflictIfFound } from "@utils";
import { Gateway } from "@models/dto/Gateway";

export class NetworkRepostory {
    private repo: Repository<NetworkDAO>

    constructor() {
        this.repo = AppDataSource.getRepository(NetworkDAO);
    }

    getAllNetworks(): Promise<NetworkDAO[]> {
        return this.repo.find();
    }

    async createNetwork(
        code: string,
        name: string,
        description: string,
        gateway: Array<Gateway>
    ): Promise<NetworkDAO> {
        throwConflictIfFound(
            await this.repo.find({ where: { code } }),
            () => true,
            `Network with code '${code}' already exists`
        );

        return this.repo.save({
            code: code,
            name: name,
            description: description,
            gateways: gateway
        });
    }

    async getNetworkByCode(code: string): Promise<NetworkDAO> {
        return findOrThrowNotFound(
            await this.repo.find({ where: { code } }),
            () => true,
            `Network with code '${code}' not found`
        );
    }

    async updateNetwork(
        code: string,
        newCode: string,
        newName: string,
        newDescription: string
    ): Promise<NetworkDAO> {
        const old: NetworkDAO = findOrThrowNotFound (
            await this.repo.find({ where: { code } }),
            () => true,
            `Network with code '${code}' not found`
        );
        throwConflictIfFound(
            await this.repo.find({ where: { code: newCode } }),
            () => true,
            `Network with code '${newCode}' already exists`
        );
        return this.repo.save({
            code: newCode || old.code,
            name: newName || old.name,
            description: newDescription || old.description,
        });    
    }

    async deleteNetwork(code: string): Promise<void> {
        await this.repo.remove(await this.getNetworkByCode(code));
    }
}