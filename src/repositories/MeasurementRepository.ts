import { AppDataSource } from "@database";
import { Repository, LessThanOrEqual, MoreThanOrEqual, Between } from "typeorm";
import { MeasurementDAO } from "@dao/MeasurementDAO";
import { SensorDAO } from "@dao/SensorDAO";
import { findOrThrowNotFound } from "@utils";
import { NetworkDAO } from "@models/dao/NetworkDAO";

export class MeasurementRepository {
  private repo: Repository<MeasurementDAO>;
  private sensorRepo: Repository<SensorDAO>;

  constructor() {
    this.repo = AppDataSource.getRepository(MeasurementDAO);
    this.sensorRepo = AppDataSource.getRepository(SensorDAO);
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

  async getMeasurementsBySensor(
    networkCode: string,
    gatewayMac: string,
    sensorMac: string,
    startDate?: string,
    endDate?: string
  ): Promise<MeasurementDAO[]> {
   

    // Validate the sensor exists within the specified network and gateway
    findOrThrowNotFound(
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
    // Parse startDate and endDate if provided
    const startDateParsed = startDate ? new Date(startDate) : new Date(0);
    const endDateParsed = endDate ? new Date(endDate) : new Date();
    // Retrieve measurements
    return this.repo.find({
      where: {
        createdAt: Between(startDateParsed, endDateParsed),
        sensor: {
          macAddress: sensorMac,
          gateway: {
            macAddress: gatewayMac,
            network: { code: networkCode },
          },
        },
      },
      relations: ["sensor", "sensor.gateway", "sensor.gateway.network"],
    });
  }

  async getMeasurementsBySensorInNetworkWithNoError( 
    networkCode: string,
    sensorMac: string,
    startDate?: string,
    endDate?: string
  ): Promise<MeasurementDAO[] | null> {
    // Parse startDate and endDate if provided
    const startDateParsed = startDate ? new Date(startDate) : new Date(0);
    const endDateParsed = endDate ? new Date(endDate) : new Date();
    //return measurements if the sensor exists in the network, otherwise return null
    const sensor = await this.sensorRepo.findOne({
      where: {
        macAddress: sensorMac,
        gateway: {
          network: { code: networkCode },
        },
      },
      relations: ["gateway", "gateway.network"],
    });
    if (!sensor) {
      return null; // Sensor not found in the network
    }
    return this.repo.find({
      where: {
        createdAt: Between(startDateParsed, endDateParsed),
        sensor: {
          macAddress: sensorMac,
          gateway: {
            network: { code: networkCode },
          },
        },     
      },
      relations: ["sensor", "sensor.gateway", "sensor.gateway.network"],
    });
  }

}