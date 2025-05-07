import { AppDataSource } from "@database";
import { Repository } from "typeorm";
import { GatewayDAO } from "@dao/GatewayDAO";
// import { NetworkDAO } from "@dao/NetworkDAO";
import { findOrThrowNotFound, throwConflictIfFound } from "@utils";

export class GatewayRepository {
  private repo: Repository<GatewayDAO>;
  // private networkRepo: Repository<NetworkDAO>;

  constructor() {
    this.repo = AppDataSource.getRepository(GatewayDAO);
    // this.networkRepo = AppDataSource.getRepository(NetworkDAO);
  }

  async getAllGateways(networkCode: string): Promise<GatewayDAO[]> {
    const network = await this.getNetwork(networkCode);
    return this.repo.find({ where: { network } });
  }

  async getGateway(networkCode: string, macAddress: string): Promise<GatewayDAO> {
    const network = await this.getNetwork(networkCode);
    return findOrThrowNotFound(
      await this.repo.find({ where: { network, macAddress } }),
      () => true,
      `Gateway '${macAddress}' not found in network '${networkCode}'`
    );
  }

  // async createGateway();

  async updateGateway(networkCode: string, oldMac: string,
   updatedData: Partial<GatewayDAO>): Promise<void> {
    const network = await this.getNetwork(networkCode);
    const gateway = await this.getGateway(networkCode, oldMac);

    if (updatedData.macAddress && updatedData.macAddress !== oldMac) {
        throwConflictIfFound(
          await this.repo.find({ where: { macAddress: updatedData.macAddress, network } }),
          () => true,
          `Gateway with MAC '${updatedData.macAddress}' already exists in network '${networkCode}'`
        );
      }

    Object.assign(gateway, updatedData);

    await this.repo.save(gateway);
  }

  // del gateway

  // getNetwork
  
}
