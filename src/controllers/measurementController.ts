import { getMeasurementsBySensorsAndNetwork, getMeasurementsBySensor, getSensorStats, getNetworkStats, getNetworkOutliers, getSensorOutliers, storeMeasurements, createMeasurement,} from "@services/measurementsService";
import {Measurement} from "@dto/Measurement";
import {Stats} from "@dto/Stats";
import {Measurements} from "@dto/Measurements";


// Controller for storing measurements
export async function storeMeasurementsController(
    networkCode: string,
    gatewayMac: string,
    sensorMac: string,
    measurements: Measurement[]
): Promise<void> {
    await storeMeasurements(networkCode, gatewayMac, sensorMac, measurements);
}

// Controller for creating a single measurement
export async function createMeasurementController(
    networkCode: string,
    gatewayMac: string,
    sensorMac: string,
    value: number,
    createdAt: Date
): Promise<void> {
    await createMeasurement(networkCode, gatewayMac, sensorMac, value, createdAt);
}

// Controller for retrieving measurements for multiple sensors in a network
export async function getMeasurementsBySensorsAndNetworkController(
    networkCode: string,
    sensorMacs: string[],
    startDate?: string,
    endDate?: string
): Promise<Measurements[]> {
    return await getMeasurementsBySensorsAndNetwork(networkCode, sensorMacs, startDate, endDate);
}

// Controller for retrieving measurements for a single sensor
export async function getMeasurementsBySensorController(
    networkCode: string,
    gatewayMac: string,
    sensorMac: string,
    startDate?: string,
    endDate?: string
): Promise<Measurements> {
    return await getMeasurementsBySensor(networkCode, gatewayMac, sensorMac, startDate, endDate);
}

// Controller for retrieving statistics for a single sensor
export async function getSensorStatsController(
    networkCode: string,
    gatewayMac: string,
    sensorMac: string,
    startDate?: string,
    endDate?: string
): Promise<Stats> {
    return await getSensorStats(networkCode, gatewayMac, sensorMac, startDate, endDate);
}

// Controller for retrieving statistics for multiple sensors in a network
export async function getNetworkStatsController(
    networkCode: string,
    sensorMacs: string[],
    startDate?: string,
    endDate?: string
): Promise<Measurements[]> {
    return await getNetworkStats(networkCode, sensorMacs, startDate, endDate);
}

// Controller for retrieving outliers for multiple sensors in a network
export async function getNetworkOutliersController(
    networkCode: string,
    sensorMacs: string[],
    startDate?: string,
    endDate?: string
): Promise<Measurements[]> {
    return await getNetworkOutliers(networkCode, sensorMacs, startDate, endDate);
}

// Controller for retrieving outliers for a single sensor
export async function getSensorOutliersController(
    networkCode: string,
    gatewayMac: string,
    sensorMac: string,
    startDate?: string,
    endDate?: string
): Promise<Measurements> {
    return await getSensorOutliers(networkCode, gatewayMac, sensorMac, startDate, endDate);
}
