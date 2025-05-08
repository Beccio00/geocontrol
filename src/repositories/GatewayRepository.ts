import { AppDataSource } from "@database";
import { Repository } from "typeorm";
import { GatewayDAO } from "@dao/GatewayDAO";
import { NetworkRepostory } from "@repositories/NetworkRepository";
import { findOrThrowNotFound, throwConflictIfFound } from "@utils";

export class GatewayRepository {
  private repo: Repository<GatewayDAO>;
  private networkRepo: NetworkRepostory;

  constructor() {
    this.repo = AppDataSource.getRepository(GatewayDAO);
    this.networkRepo = new NetworkRepostory();
  }

  async getAllGateways(networkCode: string): Promise<GatewayDAO[]> {
    const network = await this.networkRepo.getNetworkByCode(networkCode);
    return this.repo.find({ where: { network } });
  }

  async getGateway(networkCode: string, macAddress: string): Promise<GatewayDAO> {
    const network = await this.networkRepo.getNetworkByCode(networkCode);
    return findOrThrowNotFound(
      await this.repo.find({ where: { network, macAddress } }),
      () => true,
      `Gateway '${macAddress}' not found in network '${networkCode}'`
    );
  }

  async createGateway(
    networkCode: string, gatewayData: Partial<GatewayDAO> ): Promise<GatewayDAO> {
    const network = await this.networkRepo.getNetworkByCode(networkCode);

    // Check for MAC conflict within this network
    throwConflictIfFound(
      await this.repo.find({ where: { macAddress: gatewayData.macAddress, network } }),
      () => true,
      `Gateway with MAC '${gatewayData.macAddress}' already exists in network '${networkCode}'`
    );

    // N.B. The gateway is not added to the network ??

    const newGateway = this.repo.create({
      macAddress: gatewayData.macAddress!,
      name: gatewayData.name,
      description: gatewayData.description,
      network
    });

    return this.repo.save(newGateway);
  }

  async updateGateway(networkCode: string, oldMac: string,
   updatedData: Partial<GatewayDAO>): Promise<void> {
    const network = await this.networkRepo.getNetworkByCode(networkCode);
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

  async deleteGateway(networkCode: string, macAddress: string): Promise<void> {
    const gateway = await this.getGateway(networkCode, macAddress);
    await this.repo.remove(gateway);
  }

}
