import {Measurement} from "@dto/Measurement";
import {MeasurementRepository} from "@repositories/MeasurementRepository";
import {mapMeasurementDAOToDTO} from "@services/mapperService";
import {calculateStats} from "@services/statsService";
import {Stats} from "@dto/Stats";

// Function to get all measurements from an array of sensors in a network
export async function getMeasurementsBySensorsAndNetwork(
    networkCode: string,
    sensorMacs: string[]
): Promise<Measurement[]> {
    const measurementRepo = new MeasurementRepository();
    const measurements = await measurementRepo.getMeasurementsBySensorsAndNetwork(networkCode, sensorMacs);
    return measurements.map(mapMeasurementDAOToDTO);
}

export async function getMeasurementsBySensor(
    networkCode: string,
    gatewayMac: string,
    sensorMac: string
): Promise<Measurement[]> {
    const measurementRepo = new MeasurementRepository();
    const measurements = await measurementRepo.getMeasurementsBySensor(networkCode, gatewayMac, sensorMac);
    return measurements.map(mapMeasurementDAOToDTO);
}   

export async function createMeasurement(
  networkCode: string,
  gatewayMac: string,
  sensorMac: string,
  value: number,
  createdAt: Date,
): Promise<void> {
    const measurementRepo = new MeasurementRepository();
    await measurementRepo.createMeasurement(networkCode, gatewayMac, sensorMac, value, createdAt, false);
}

export async function getSensorStats(
    networkCode: string,
    gatewayMac: string,
    sensorMac: string
): Promise<Stats> {
    const measurementRepo = new MeasurementRepository();
    const measurementDAOs = await measurementRepo.getMeasurementsBySensor(
      networkCode,
      gatewayMac,
      sensorMac
    );
    const measurements = measurementDAOs.map(mapMeasurementDAOToDTO);
    return calculateStats(measurements);
}

export async function getNetworkOutliers(
    networkCode: string,
    sensorMacs: string[]
  ): Promise<Measurement[]> {
    const measurementRepo = new MeasurementRepository();
    const measurementDAOs = await measurementRepo.getMeasurementsBySensorsAndNetwork(
      networkCode,
      sensorMacs
    );
  
    // Map DAOs to DTOs
    const measurements = measurementDAOs.map(mapMeasurementDAOToDTO);
  
    // Calculate statistics for the measurements
    const stats = calculateStats(measurements);
  
    // Update the isOutlier property based on thresholds
    const outliers = measurements.filter(
      (measurement) =>
        measurement.value > stats.upperThreshold ||
        measurement.value < stats.lowerThreshold
    );
    outliers.map((measurement) => {
      measurement.isOutlier = true;
    });
    return outliers;
  }

  export async function getSensorOutliers(
    networkCode: string,
    gatewayMac: string,
    sensorMac: string
  ): Promise<Measurement[]> {
    const measurementRepo = new MeasurementRepository();
  
    // Retrieve all measurements for the sensor
    const measurementDAOs = await measurementRepo.getMeasurementsBySensor(
      networkCode,
      gatewayMac,
      sensorMac
    );
  
    // Map DAOs to DTOs
    const measurements = measurementDAOs.map(mapMeasurementDAOToDTO);
  
    // Calculate statistics for the measurements
    const stats = calculateStats(measurements);
  
    // Filter measurements to find outliers
    const outliers = measurements.filter(
      (measurement) =>
        measurement.value > stats.upperThreshold ||
        measurement.value < stats.lowerThreshold
    );
  
    // Mark outliers explicitly
    outliers.forEach((measurement) => {
      measurement.isOutlier = true;
    });
  
    return outliers;
  }

  export async function getNetworkStats(
    networkCode: string,
    sensorMacs: string[]
  ): Promise<Stats> {
    const measurementRepo = new MeasurementRepository();
  
    // Retrieve all measurements for the specified sensors in the network
    const measurementDAOs = await measurementRepo.getMeasurementsBySensorsAndNetwork(
      networkCode,
      sensorMacs
    );
  
    // Map DAOs to DTOs
    const measurements = measurementDAOs.map(mapMeasurementDAOToDTO);
  
    // Calculate and return statistics
    return calculateStats(measurements);
  }