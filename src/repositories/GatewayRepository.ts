import { AppDataSource } from "@database";
import { Repository } from "typeorm";
import { GatewayDAO } from "@dao/GatewayDAO";
import { NetworkDAO } from "@dao/NetworkDAO";
import { NetworkRepository } from "@repositories/NetworkRepository";
import { findOrThrowNotFound, throwConflictIfFound } from "@utils";
import { Sensor } from "@models/dto/Sensor";
import { SensorDAO } from "@models/dao/SensorDAO";

export class GatewayRepository {
  private repo: Repository<GatewayDAO>;
  private networkRepo: Repository<NetworkDAO>;

  constructor() {
    this.repo = AppDataSource.getRepository(GatewayDAO);
    this.networkRepo = AppDataSource.getRepository(NetworkDAO);
  }

  async getAllGateways(networkCode: string): Promise<GatewayDAO[]> {
    //validazione networkCode
    findOrThrowNotFound(
      await this.networkRepo.find({ where: { code: networkCode } }),
      () => true,
      `Network with code '${networkCode}' not found `
    );   
    return this.repo.find({ where: { network: {code: networkCode} }, relations: ['network'] });
  }

  async getGateway(networkCode: string, macAddress: string): Promise<GatewayDAO> {
    //validazione networkCode
    findOrThrowNotFound(
      await this.networkRepo.find({ where: { code: networkCode } }),
      () => true,
      `Network with code '${networkCode}' not found `
    );
    return findOrThrowNotFound(
        await this.repo.find({
            where: {
                macAddress: macAddress,
                network: { code: networkCode },
            },
            relations: ['network'],
        }),
        () => true,
        `Gateway with mac '${macAddress}' not found in network '${networkCode}'`
    );
  }

  async createGateway(
    networkCode: string, 
    macAddress: string,
    name: string,
    description: string,
    sensors: Array<SensorDAO> ): Promise<GatewayDAO> {
    //validazione networkCode
    findOrThrowNotFound(
      await this.networkRepo.find({ where: { code: networkCode } }),
      () => true,
      `Network with code '${networkCode}' not found `
    ); 

    // Check for MAC conflict within this network
    throwConflictIfFound(
      await this.repo.find({ where: { macAddress} }),
      () => true,
      `Gateway with MAC '${macAddress}' already exists in network '${networkCode}'`
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
