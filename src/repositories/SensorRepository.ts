import { AppDataSource } from "@database";
import { Repository } from "typeorm";
import { SensorDAO } from "@dao/SensorDAO";
import { GatewayDAO } from "@models/dao/GatewayDAO";
import { NetworkDAO } from "@models/dao/NetworkDAO";
import { findOrThrowNotFound, throwConflictIfFound } from "@utils";

export class SensorRepository {
  private repo: Repository<SensorDAO>;
  private gatewayRepo : Repository<GatewayDAO>;
  private networkRepo : Repository<NetworkDAO>;

  constructor() {
    this.repo = AppDataSource.getRepository(SensorDAO);
    this.gatewayRepo = AppDataSource.getRepository(GatewayDAO);
    this.networkRepo = AppDataSource.getRepository(NetworkDAO);
  }

  async getAllSensor(networkCode: string, gatewayMac: string):Promise<SensorDAO[]> {    
    //validazione networkCode
    findOrThrowNotFound(
      await this.networkRepo.find({ where: { code: networkCode } }),
      () => true,
      `Network with code '${networkCode}' not found `
    );    
    //validazione gatewayMac    
    findOrThrowNotFound(
      await this.gatewayRepo.find({
        where: {
          macAddress: gatewayMac,
          network: { code: networkCode },
        }
      }),
      () => true,
      `Gateway with mac '${gatewayMac}' not found in network '${networkCode}'`
    );
    return await this.repo.find({
      where: {
        gateway: {
          macAddress: gatewayMac,
          network: {
            code: networkCode
          }
        }
      }
    });
  }

  async createSensor(
    networkCode: string,
    gatewayMac: string,
    macAddress: string,
    name: string,
    description: string,
    variable: string,
    unit: string
  ): Promise<SensorDAO> {      
    
    //validazione networkCode
    findOrThrowNotFound(
      await this.networkRepo.find({ where: { code: networkCode } }),
      () => true,
      `Network with code '${networkCode}' not found `
    );    
    //validazione gatewayMac    
    const gateway = findOrThrowNotFound(
      await this.gatewayRepo.find({
        where: {
          macAddress: gatewayMac,
          network: { code: networkCode },
        }
      }),
      () => true,
      `Gateway with mac '${gatewayMac}' not found in network '${networkCode}'`
    );       

    throwConflictIfFound(
      await this.repo.find({ where: { macAddress} }),
      () => true,
      `Sensor with macAddress '${macAddress}' already exists`
    ); 

    return this.repo.save({
      macAddress : macAddress,
      name : name,
      description : description,
      variable : variable,
      unit : unit,
      gateway : gateway
    });
  }
  
  async getSensorByMac(networkCode: string, gatewayMac: string, sensorMac : string):Promise<SensorDAO>{
    //validazione networkCode
    findOrThrowNotFound(
      await this.networkRepo.find({ where: { code: networkCode } }),
      () => true,
      `Network with code '${networkCode}' not found `
    );    
    //validazione gatewayMac    
    findOrThrowNotFound(
      await this.gatewayRepo.find({
        where: {
          macAddress: gatewayMac,
          network: { code: networkCode },
        }
      }),
      () => true,
      `Gateway with mac '${gatewayMac}' not found in network '${networkCode}'`
    );
    return findOrThrowNotFound(
      await this.repo.find({
        where: {
          macAddress: sensorMac,
          gateway: {
            macAddress: gatewayMac,
            network: {
              code: networkCode
            }
          }
        }
      }),
      () => true,
      `Sensor with macAddress '${sensorMac}' not found in gateway '${gatewayMac}' and network '${networkCode}'`    
    );
  }

  async updateSensor(
    networkCode: string,
    gatewayMac: string, 
    sensorMac : string,
    newMacAddress: string,
    newName: string,
    newDescription: string,
    newVariable : string,
    newUnit : string
  ): Promise<SensorDAO> {  
    //validazione networkCode
    findOrThrowNotFound(
      await this.networkRepo.find({ where: { code: networkCode } }),
      () => true,
      `Network with code '${networkCode}' not found `
    );    
    //validazione gatewayMac    
    findOrThrowNotFound(
      await this.gatewayRepo.find({
        where: {
          macAddress: gatewayMac,
          network: { code: networkCode },
        }
      }),
      () => true,
      `Gateway with mac '${gatewayMac}' not found in network '${networkCode}'`
    );
    const oldSensor: SensorDAO = findOrThrowNotFound (      
      await this.repo.find({ 
        where: {      
          macAddress: sensorMac,
          gateway: {
            macAddress: gatewayMac,
            network: {
              code: networkCode
            }
          }
        }
      }),
      () => true,
      `Sensor with macAddress '${sensorMac}' not found in gateway '${gatewayMac}' and network '${networkCode}'`
    );

    // Check for MAC conflict within this network
    if (newMacAddress && newMacAddress !== sensorMac) {
      throwConflictIfFound(
        await this.repo.find({ 
          where: {      
            macAddress: newMacAddress,
            gateway: {
              macAddress: gatewayMac,
              network: {
                code: networkCode
              }
            }       
          } 
        }),
        () => true,
        `Sensor with MAC '${newMacAddress}' already exists in network '${networkCode}'`
      );
    }

    oldSensor.macAddress = newMacAddress || oldSensor.macAddress;
    oldSensor.name = newName || oldSensor.name;
    oldSensor.description = newDescription || oldSensor.description;
    oldSensor.variable = newVariable || oldSensor.variable;
    oldSensor.unit = newUnit || oldSensor.unit;

    return this.repo.save(oldSensor);    
  }
 
  async deleteSensorByMac(networkCode: string, gatewayMac: string, sensorMac : string): Promise<void>{
    await this.repo.remove(await this.getSensorByMac(networkCode,gatewayMac,sensorMac));
  }

  
}