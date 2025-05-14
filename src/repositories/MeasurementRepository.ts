import { AppDataSource } from "@database";
import { Repository, LessThanOrEqual, MoreThanOrEqual } from "typeorm";
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
    isOutlier?: boolean
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
    startDate?: Date,
    endDate?: Date
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

    // Retrieve measurements
    return this.repo.find({
      where: {
        sensor: {
          macAddress: sensorMac,
          gateway: {
            macAddress: gatewayMac,
            network: { code: networkCode },
          },
        },
        ...(startDate && { createdAt: MoreThanOrEqual(startDate) }), // Check startDate if provided
        ...(endDate && { createdAt: LessThanOrEqual(endDate) }),        // Check endDate if provided
      },
      relations: ["sensor", "sensor.gateway", "sensor.gateway.network"],
    });
  }

  async getMeasurementsBySensorInNetworkWithNoError( 
    networkCode: string,
    sensorMac: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<MeasurementDAO[] | null> {
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
        sensor: {
          macAddress: sensorMac,
          gateway: {
            network: { code: networkCode },
          },
        },
        ...(startDate && { createdAt: MoreThanOrEqual(startDate) }), // Check startDate if provided
        ...(endDate && { createdAt: LessThanOrEqual(endDate) }),        // Check endDate if provided
      },
      relations: ["sensor", "sensor.gateway", "sensor.gateway.network"],
    });
  }

}