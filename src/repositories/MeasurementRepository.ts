import { AppDataSource } from "@database";
import { Repository, LessThanOrEqual, MoreThanOrEqual, Between, In } from "typeorm";
import { MeasurementDAO } from "@dao/MeasurementDAO";
import { SensorDAO } from "@dao/SensorDAO";
import { findOrThrowNotFound } from "@utils";
import { NetworkDAO } from "@models/dao/NetworkDAO";
import { GatewayDAO } from "@models/dao/GatewayDAO";

export class MeasurementRepository {
  private repo: Repository<MeasurementDAO>;
  private networkRepo: Repository<NetworkDAO>;
  private gatewayRepo: Repository<GatewayDAO>;
  private sensorRepo: Repository<SensorDAO>;

  constructor() {
    this.repo = AppDataSource.getRepository(MeasurementDAO);
    this.sensorRepo = AppDataSource.getRepository(SensorDAO);
    this.networkRepo = AppDataSource.getRepository(NetworkDAO);
    this.gatewayRepo = AppDataSource.getRepository(GatewayDAO);
  }

  async getMeasurementsByNetwork(
    networkCode: string,
    sensorMacs?: string[],
    startDate?: string,
    endDate?: string
  ): Promise<MeasurementDAO[]> {
    const startDateParsed = startDate ? new Date(startDate) : new Date(0);
    const endDateParsed = endDate ? new Date(endDate) : new Date();


    findOrThrowNotFound(
      await this.networkRepo.find({ where: { code: networkCode } } ),
        () => true,
        `Network with code '${networkCode}' not found`
    );

    const gateways = await this.gatewayRepo.find({ where: { network: { code: networkCode } } });
    const gatewayIds = gateways.map(gateway => gateway.id);

    // Trova i sensori nei gateway della rete (eventualmente filtrati per MAC)
    const sensorWhere: any = {
      gateway: { id: In(gatewayIds) }
    };

    if (sensorMacs?.length) {
      sensorWhere.macAddress = In(sensorMacs);
    }

    const sensors = await this.sensorRepo.find({ where: sensorWhere });
    const sensorIds = sensors.map(s => s.id);

    // Costruisci il filtro per le misure
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

    return this.repo.find({
      where: measurementWhere,
      order: { createdAt: "ASC" },
      relations: { sensor: true }
    });
  
  }



  async createMeasurement(
    networkCode: string,
    gatewayMac: string,
    sensorMac: string,
    value: number,
    createdAt: Date,
  ): Promise<MeasurementDAO> {
    // Validate the sensor exists
    const sensor = findOrThrowNotFound(
      await this.sensorRepo.find({
        where: {
          macAddress: sensorMac,
          gateway: {
            macAddress: gatewayMac,
            network: { code: networkCode },
          },
        },
        relations: ["gateway", "gateway.network"],
      }),
      () => true,
      `Sensor with MAC '${sensorMac}' not found in gateway '${gatewayMac}' and network '${networkCode}'`
    );

    // Create and save the measurement
    const measurement = this.repo.create({
      value,
      createdAt,
      sensor,
    });

    return this.repo.save(measurement);
  }
}
//   async getMeasurementsBySensor(
//     networkCode: string,
//     gatewayMac: string,
//     sensorMac: string,
//     startDate?: string,
//     endDate?: string
//   ): Promise<MeasurementDAO[]> {
   

//     findOrThrowNotFound(
//       await this.sensorRepo.find({
//         where: {
//           macAddress: sensorMac,
//           gateway: {
//             macAddress: gatewayMac,
//             network: { code: networkCode },
//           },
//         },
//         relations: ["gateway", "gateway.network"],
//       }),
//       () => true,
//       `Sensor with MAC '${sensorMac}' not found in gateway '${gatewayMac}' and network '${networkCode}'`
//     );
//     // Parse startDate and endDate if provided
//     const startDateParsed = startDate ? new Date(startDate) : new Date(0);
//     const endDateParsed = endDate ? new Date(endDate) : new Date();
//     // Retrieve measurements
//     return this.repo.find({
//       where: {
//         createdAt: Between(startDateParsed, endDateParsed),
//         sensor: {
//           macAddress: sensorMac,
//           gateway: {
//             macAddress: gatewayMac,
//             network: { code: networkCode },
//           },
//         },
//       },
//       relations: ["sensor", "sensor.gateway", "sensor.gateway.network"],
//     });
//   }

//   async getMeasurementsBySensorInNetworkWithNoError( 
//     networkCode: string,
//     sensorMac: string,
//     startDate?: string,
//     endDate?: string
//   ): Promise<MeasurementDAO[] | null> {
//     // Parse startDate and endDate if provided
//     const startDateParsed = startDate ? new Date(startDate) : new Date(0);
//     const endDateParsed = endDate ? new Date(endDate) : new Date();
//     //return measurements if the sensor exists in the network, otherwise return null
//     const sensor = await this.sensorRepo.findOne({
//       where: {
//         macAddress: sensorMac,
//         gateway: {
//           network: { code: networkCode },
//         },
//       },
//       relations: ["gateway", "gateway.network"],
//     });
//     if (!sensor) {
//       return null; // Sensor not found in the network
//     }
//     return this.repo.find({
//       where: {
//         createdAt: Between(startDateParsed, endDateParsed),
//         sensor: {
//           macAddress: sensorMac,
//           gateway: {
//             network: { code: networkCode },
//           },
//         },     
//       },
//       relations: ["sensor", "sensor.gateway", "sensor.gateway.network"],
//     });
//   }

// }