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
    sensorMacs: string[]
): Promise<Measurements[]> {
    //validate the networkCode exists or throw not found error
    const networkRepo= new NetworkRepository();
    const network = await networkRepo.getNetworkByCode(networkCode);

    const processedMeasurements=[];
    const measurementRepo = new MeasurementRepository();
    //for each sensor in the array, get the measurements from the database
    await Promise.all(sensorMacs.map(async (sensorMac) => { 
        const measurementDAOs=measurementRepo.getMeasurementsBySensorInNetworkWithNoError(networkCode, sensorMac);
        if(measurementDAOs){
            processedMeasurements.push(processMeasurements((await (measurementDAOs)).map((dao) => mapMeasurementDAOToDTO(dao)), sensorMac));
        }
    }));

    return processedMeasurements

}

export async function getMeasurementsBySensor(
    networkCode: string,
    gatewayMac: string,
    sensorMac: string,
    startDate?: Date,
    endDate?: Date
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
    await measurementRepo.createMeasurement(networkCode, gatewayMac, sensorMac, value, createdAt, false);
}

export async function getSensorStats(
    networkCode: string,
    gatewayMac: string,
    sensorMac: string,
    startDate?: Date,
    endDate?: Date
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
    return calculateStats(measurements);
}


export async function getNetworkStats(
    networkCode: string,
    sensorMacs: string[]
  ): Promise<Measurements[]> {
    const measurementRepo = new MeasurementRepository();
    const measurements= await getMeasurementsBySensorsAndNetwork(networkCode, sensorMacs);
    measurements.map( (measurement) => {measurement.measurements=null});
    return measurements;
  }

export async function getNetworkOutliers(
    networkCode: string,
    sensorMacs: string[]
  ): Promise<Measurements[]> {
    const measurementRepo = new MeasurementRepository();
    const measurements= await getMeasurementsBySensorsAndNetwork(networkCode, sensorMacs);
    measurements.map( (measurement) => {measurement.measurements=measurement.measurements.filter((measurement) => measurement.isOutlier)});
    return measurements;
  }

  export async function getSensorOutliers(
    networkCode: string,
    gatewayMac: string,
    sensorMac: string,
    startDate?: Date,
    endDate?: Date
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

