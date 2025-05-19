import {Measurement} from "@dto/Measurement";
import {MeasurementRepository} from "@repositories/MeasurementRepository";
import {mapMeasurementDAOToDTO} from "@services/mapperService";
import {calculateStats, processMeasurements} from "@services/statsService";
import {Stats} from "@dto/Stats";
import { Measurements } from "@models/dto/Measurements";
import { NetworkRepository } from "@repositories/NetworkRepository";

// Function to get all measurements from an array of sensors in a network
export async function getMeasurementsBySensorsAndNetwork(
    networkCode: string,
    sensorMacs: string[],
    startDate?: string,
    endDate?: string
): Promise<Measurements[]> {
    //validate the networkCode exists or throw not found error
    const networkRepo= new NetworkRepository();
    const network = await networkRepo.getNetworkByCode(networkCode);

    const processedMeasurements=[];
    const measurementRepo = new MeasurementRepository();

    //for each sensor in the array, get the measurements from the database
    await Promise.all(sensorMacs.map(async (sensorMac) => { 
        const measurementDAOs= await measurementRepo.getMeasurementsBySensorInNetworkWithNoError(networkCode, sensorMac, startDate, endDate);
        if(measurementDAOs){
            processedMeasurements.push(processMeasurements((measurementDAOs).map((dao) => mapMeasurementDAOToDTO(dao)), sensorMac));
        }
    }));

    return processedMeasurements

}

export async function getMeasurementsBySensor(
    networkCode: string,
    gatewayMac: string,
    sensorMac: string,
    startDate?: string,
    endDate?: string
): Promise<Measurements> {
    const measurementRepo = new MeasurementRepository();
    const measurementDAOs = await measurementRepo.getMeasurementsBySensor(networkCode, gatewayMac, sensorMac, startDate, endDate);
    const measurements = measurementDAOs.map((dao) => mapMeasurementDAOToDTO(dao));
    return processMeasurements(measurements, sensorMac);
}   

export async function createMeasurement(
  networkCode: string,
  gatewayMac: string,
  sensorMac: string,
  value: number,
  createdAt: Date,
): Promise<void> {
    const measurementRepo = new MeasurementRepository();
    await measurementRepo.createMeasurement(networkCode, gatewayMac, sensorMac, value, createdAt);
}

export async function storeMeasurements(
    networkCode: string,
    gatewayMac: string,
    sensorMac: string,
    measurements: Measurement[]
): Promise<void> {  
    await Promise.all(
        measurements.map(async (measurement) => {
            await createMeasurement(
                networkCode,
                gatewayMac,
                sensorMac,
                measurement.value,
                measurement.createdAt
            );
        })
    );
}

export async function getSensorStats(
    networkCode: string,
    gatewayMac: string,
    sensorMac: string,
    startDate?: string,
    endDate?: string
): Promise<Stats> {
    const measurementRepo = new MeasurementRepository();
    const measurementDAOs = await measurementRepo.getMeasurementsBySensor(
        networkCode,
        gatewayMac,
        sensorMac,
        startDate,
        endDate
    );
    const measurements = measurementDAOs.map((dao) => mapMeasurementDAOToDTO(dao));
    const stats: Stats = calculateStats(measurements);
    return stats;
}


export async function getNetworkStats(
    networkCode: string,
    sensorMacs: string[],
    startDate?: string,
    endDate?: string
  ): Promise<Measurements[]> {
    const measurements= await getMeasurementsBySensorsAndNetwork(networkCode, sensorMacs, startDate, endDate);
    measurements.map( (measurement) => {measurement.measurements=[]});
    console.log(measurements);
    return measurements;
  }

export async function getNetworkOutliers(
    networkCode: string,
    sensorMacs: string[],
    startDate?: string,
    endDate?: string
  ): Promise<Measurements[]> {
    const measurements= await getMeasurementsBySensorsAndNetwork(networkCode, sensorMacs, startDate, endDate);
    measurements.map( (measurement) => {measurement.measurements=measurement.measurements.filter((measurement) => measurement.isOutlier)});
    return measurements;
  }

  export async function getSensorOutliers(
    networkCode: string,
    gatewayMac: string,
    sensorMac: string,
    startDate?: string,
    endDate?: string
  ): Promise<Measurements> {
    const measurementRepo = new MeasurementRepository();
  
    // Retrieve all measurements for the sensor
    const measurementDAOs = await measurementRepo.getMeasurementsBySensor(
        networkCode,
        gatewayMac,
        sensorMac,
        startDate,
        endDate
    );
  
    // Map DAOs to DTOs
    const measurements = measurementDAOs.map((dao) => mapMeasurementDAOToDTO(dao));
    let processedMeasurements = processMeasurements(measurements, sensorMac);
    //update processedMeasurements vector removing measurements that are not outliers
    processedMeasurements.measurements = processedMeasurements.measurements.filter(
      (measurement) => measurement.isOutlier
    );
    return processedMeasurements;
  }

