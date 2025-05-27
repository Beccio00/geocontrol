import { AppDataSource } from "@database";
import { Repository, LessThanOrEqual, MoreThanOrEqual, Between, In } from "typeorm";
import { SensorDAO } from "@dao/SensorDAO";
import { GatewayDAO } from "@models/dao/GatewayDAO";
import { NetworkDAO } from "@models/dao/NetworkDAO";
import { findOrThrowNotFound} from "@utils";
import { MeasurementDAO } from "@models/dao/MeasurementDAO";

export class MeasurementRepository{
  private repo: Repository<MeasurementDAO>;
  private networkRepo : Repository<NetworkDAO>;
  private gatewayRepo : Repository<GatewayDAO>;
  private sensorRepo : Repository<SensorDAO>;

  constructor() {
    this.repo = AppDataSource.getRepository(MeasurementDAO);
    this.networkRepo = AppDataSource.getRepository(NetworkDAO);
    this.gatewayRepo = AppDataSource.getRepository(GatewayDAO);
    this.sensorRepo = AppDataSource.getRepository(SensorDAO);
  }

  async storeMeasurement(
      networkCode: string,
      gatewayMac: string,
      sensorMac: string,
      value: number,
      createdAt: Date,
  ): Promise<MeasurementDAO> {
    
    findOrThrowNotFound(
    await this.networkRepo.find({ where: { code: networkCode } }),
    () => true,
    `Network with code '${networkCode}' not found `
    );       
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
    const sensor = findOrThrowNotFound(
      await this.sensorRepo.find({ 
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
      `Sensor with mac '${sensorMac}' not found in gateway '${gatewayMac}' and network '${networkCode}'`
    );

    return this.repo.save({
      value,
      createdAt,
      sensor,
    });
  }

  async getMeasurementsBySensor(
    networkCode: string, 
    gatewayMac: string,
    sensorMac : string,
    startDate?: Date,
    endDate? : Date
  ): Promise<MeasurementDAO[]>{
    
    findOrThrowNotFound(
    await this.networkRepo.find({ where: { code: networkCode } }),
    () => true,
    `Network with code '${networkCode}' not found `
    );    
        
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
    
    findOrThrowNotFound(
      await this.sensorRepo.find({ 
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
      `Sensor with mac '${sensorMac}' not found in gateway '${gatewayMac}' and network '${networkCode}'`
    );
    
    const where: any = {
      sensor: {
        macAddress: sensorMac,
        gateway: {
          macAddress: gatewayMac,
          network: {
            code: networkCode
          }
        }
      }
    };
    
    where.createdAt =
    startDate && endDate ? Between(startDate, endDate) :
    startDate ? MoreThanOrEqual(startDate) :
    endDate ? LessThanOrEqual(endDate) :
    undefined;

    return await this.repo.find({ where, order: { createdAt: "ASC" }});
  }   

  async getMeasurementsByNetwork(
    networkCode: string,
    sensorMacs?: string[],
    startDate?: Date,
    endDate?: Date,
  ): Promise<{ sensorMac: string; measurements: MeasurementDAO[] }[]> {

    findOrThrowNotFound(
      await this.networkRepo.find({ where: { code: networkCode } } ),
        () => true,
        `Network with code '${networkCode}' not found`
    );

    const gateways = await this.gatewayRepo.find({ 
      where: { network: { code: networkCode } } 
    });

    if (!gateways.length) return [];
  
    const gatewayIds = gateways.map(gateway => gateway.id);

    const sensorWhere: any = {
      gateway: { id: In(gatewayIds) }
    };

    sensorWhere.macAddress = sensorMacs ? In(sensorMacs) : sensorWhere.macAddress;

    const sensors = await this.sensorRepo.find({ 
      where: sensorWhere 
    });
    
    if (!sensors.length) return [];

    const sensorIds = sensors.map(sensor => sensor.id);

    const measurementWhere: any = {
      sensor: { id: In(sensorIds) }
    };

    if (startDate && endDate) {
      measurementWhere.createdAt = Between(startDate, endDate);
    } else if (startDate) {
      measurementWhere.createdAt = MoreThanOrEqual(startDate);
    } else if (endDate) {
      measurementWhere.createdAt = LessThanOrEqual(endDate);
    }

    const measurement = await this.repo.find({
      where: measurementWhere,
      order: { createdAt: "ASC" },
      relations: { sensor: true }
    });

    const measurementsBySensor: Record<string, MeasurementDAO[]> = {};
    sensors.forEach(sensor => {
      measurementsBySensor[sensor.macAddress] = [];
    });

    
    measurement.forEach(m => {
      const mac = m.sensor.macAddress;
      measurementsBySensor[mac].push(m);
    });

    return Object.entries(measurementsBySensor).map(([sensorMac, measurements]) => ({
      sensorMac,
      measurements
    }));
  }  
}