import { Measurement as MeasurementDTO } from "@dto/Measurement";
import { Measurements as MeasurementsDTO } from "@dto/Measurements"
import { MeasurementRepository } from "@repositories/MeasurementRepository";
import { Stats as StatsDTO } from "@models/dto/Stats";
import { createStatsDTO } from "@services/mapperService";
import { calcStats, initializeRepositoryAndDates, processSensorMeasurements } from "@services/measurementsService";


export async function getMeasurementsBySensor(
    networkCode: string, 
    gatewayMac: string,
    sensorMac: string,
    startDate?: string,
    endDate?: string
): Promise<MeasurementsDTO> {
    const { measurementRepo, startDateISOUTC, endDateISOUTC } = initializeRepositoryAndDates(startDate, endDate);
    
    const sensorMeasurements = await measurementRepo.getMeasurementsBySensor(networkCode, gatewayMac, sensorMac, startDateISOUTC, endDateISOUTC);
    
    return processSensorMeasurements(sensorMac, sensorMeasurements, startDateISOUTC, endDateISOUTC);
}

export async function storeMeasurement(
    networkCode: string, 
    gatewayMac: string,
    sensorMac: string, 
    measurements: MeasurementDTO[]
): Promise<void> {    
    const measurementRepo = new MeasurementRepository();
    await Promise.all(
        measurements.map(async (measurement) => {
            await measurementRepo.storeMeasurement(
                networkCode,
                gatewayMac,
                sensorMac,
                measurement.value,
                measurement.createdAt
            );
        })
    );
}

export async function getStatisticsBySensor(
    networkCode: string, 
    gatewayMac: string,
    sensorMac: string,
    startDate?: string,
    endDate?: string
): Promise<StatsDTO> {
    const { measurementRepo, startDateISOUTC, endDateISOUTC } = initializeRepositoryAndDates(startDate, endDate);
    
    const sensorMeasurements = await measurementRepo.getMeasurementsBySensor(networkCode, gatewayMac, sensorMac, startDateISOUTC, endDateISOUTC);
    const stats = calcStats(sensorMeasurements);

    return createStatsDTO(stats.mean, stats.variance, stats.upperThreshold, stats.lowerThreshold, startDateISOUTC, endDateISOUTC);
}

export async function getOutliersBySensor(
    networkCode: string, 
    gatewayMac: string,
    sensorMac: string,
    startDate?: string,
    endDate?: string
): Promise<MeasurementsDTO> {
    const { measurementRepo, startDateISOUTC, endDateISOUTC } = initializeRepositoryAndDates(startDate, endDate);
    
    const sensorMeasurements = await measurementRepo.getMeasurementsBySensor(networkCode, gatewayMac, sensorMac, startDateISOUTC, endDateISOUTC);
    
    return processSensorMeasurements(sensorMac, sensorMeasurements, startDateISOUTC, endDateISOUTC, true, true);
}

export async function getMeasuramentsByNetwork(
    networkCode: string,
    sensorMacs?: string[],
    startDate?: string,
    endDate?: string
): Promise<MeasurementsDTO[]> {
    const { measurementRepo, startDateISOUTC, endDateISOUTC } = initializeRepositoryAndDates(startDate, endDate);
      
    const sensorsMeasurements = await measurementRepo.getMeasurementsByNetwork(networkCode, sensorMacs, startDateISOUTC, endDateISOUTC);

    const results: MeasurementsDTO[] = [];
    
    for (const measurement of sensorsMeasurements) {
        const measurementsDTO = processSensorMeasurements(measurement.sensorMac,measurement.measurements, startDateISOUTC, endDateISOUTC);        
        results.push(measurementsDTO); 
    }

    return results;
} 

export async function getStatisticsByNetwork(
    networkCode: string, 
    sensorMacs?: string[], 
    startDate?: string, 
    endDate?: string
    ): Promise<MeasurementsDTO[]> {
    const { measurementRepo, startDateISOUTC, endDateISOUTC } = initializeRepositoryAndDates(startDate, endDate);
    
    const sensorsMeasurements = await measurementRepo.getMeasurementsByNetwork(networkCode, sensorMacs, startDateISOUTC, endDateISOUTC);

    const results: MeasurementsDTO[] = [];
    
    for (const measurement of sensorsMeasurements) {
        const measurementsDTO = processSensorMeasurements(measurement.sensorMac,measurement.measurements, startDateISOUTC, endDateISOUTC,false,false);        
        results.push(measurementsDTO); 
    }

    return results;
}

export async function getOutliersByNetwork(
    networkCode: string, 
    sensorMacs?: string[],
    startDate?: string,
    endDate?: string
): Promise<MeasurementsDTO[]> {
    const { measurementRepo, startDateISOUTC, endDateISOUTC } = initializeRepositoryAndDates(startDate, endDate);
    
    const sensorsMeasurements = await measurementRepo.getMeasurementsByNetwork(networkCode, sensorMacs, startDateISOUTC, endDateISOUTC);

    const results: MeasurementsDTO[] = [];
    
    for (const measurement of sensorsMeasurements) {
        const measurementsDTO = processSensorMeasurements(measurement.sensorMac,measurement.measurements, startDateISOUTC, endDateISOUTC,true,true);        
        results.push(measurementsDTO); 
    }

    return results;
}