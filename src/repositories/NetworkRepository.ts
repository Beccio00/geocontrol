import { AppDataSource } from "@database";
import { Repository } from "typeorm";
import { NetworkDAO } from "@dao/NetworkDAO";
import { UserType } from "@models/UserType";
import { findOrThrowNotFound, throwConflictIfFound } from "@utils";

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
        gateway: string[]
    ) {

    }

}