import { AppDataSource } from "@database";
import { Repository } from "typeorm";
import { MeasurementDAO } from "@dao/MeasurementDAO";
import { SensorDAO } from "@dao/SensorDAO";
import { findOrThrowNotFound } from "@utils";

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
      isOutlier,
      sensor,
    });

    return this.repo.save(measurement);
  }

  async getMeasurementsBySensor(
    networkCode: string,
    gatewayMac: string,
    sensorMac: string
  ): Promise<MeasurementDAO[]> {
    // Validate the sensor exists
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
      },
      relations: ["sensor", "sensor.gateway", "sensor.gateway.network"],
    });
  }
}