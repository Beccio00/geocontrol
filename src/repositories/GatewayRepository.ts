import { AppDataSource } from "@database";
import { Repository } from "typeorm";
import { GatewayDAO } from "@dao/GatewayDAO";
import { NetworkDAO } from "@dao/NetworkDAO";
import { findOrThrowNotFound, throwConflictIfFound } from "@utils";
import { Sensor } from "@models/dto/Sensor";

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
    return this.repo.find({ where: { network: {code: networkCode} }});
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
            }
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
    sensor: Array<Sensor> ): Promise<GatewayDAO> {
    //validazione networkCode
    const network = await findOrThrowNotFound(
      await this.networkRepo.find({ where: { code: networkCode } }),
      () => true,
      `Network with code '${networkCode}' not found `
    ); 

    // Check for MAC conflict within this network
    throwConflictIfFound(
      await this.repo.find({ where: { macAddress}}),
      () => true,
      `Gateway with MAC '${macAddress}' already exists in network '${networkCode}'`
    );

    const newGateway = this.repo.create({
      macAddress: macAddress,
      name: name,
      description: description,
      sensors: sensor,
      network: network
    });

    return this.repo.save(newGateway);
  }

  async updateGateway(networkCode: string,
    oldMac: string,
    newMacAddress: string,
    newName: string,
    newDescription: string,): Promise<GatewayDAO> {
    //validazione networkCode
    findOrThrowNotFound(
      await this.networkRepo.find({ where: { code: networkCode } }),
      () => true,
      `Network with code '${networkCode}' not found `
    ); 
    
    const oldGateway: GatewayDAO = await findOrThrowNotFound(
      await this.repo.find({
        where: {
          macAddress: oldMac,
          network: {
            code: networkCode
          }
        }
      }),
      () => true,
      `Gateway with MAC '${oldMac}' not found in network '${networkCode}'`
    );

    // Check for MAC conflict within this network
    if (newMacAddress && newMacAddress !== oldMac) {
      throwConflictIfFound(
        await this.repo.find({ where: { macAddress: newMacAddress, network: { code: networkCode }} }),
        () => true,
        `Gateway with MAC '${newMacAddress}' already exists in network '${networkCode}'`
      );
    }

    oldGateway.macAddress  = newMacAddress  || oldGateway.macAddress;
    oldGateway.name        = newName       || oldGateway.name;
    oldGateway.description = newDescription|| oldGateway.description;

    return this.repo.save(oldGateway)
  }

  async deleteGateway(networkCode: string, macAddress: string): Promise<void> {
    const gateway = await this.getGateway(networkCode, macAddress);
    await this.repo.remove(gateway);
  }

}
