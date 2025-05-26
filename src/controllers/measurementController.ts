import {Measurement as MeasurementDTO} from "@dto/Measurement";
import {Measurements as MeasurementsDTO, MeasurementsToJSON} from "@dto/Measurements"
import {MeasurementRepository} from "@repositories/MeasurementRepository";
import { Stats as StatsDTO } from "@models/dto/Stats";
import {createMeasurementsDTO, createStatsDTO, mapMeasurementDAOToDTO } from "@services/mapperService";
import { calcStats, processMeasurements, groupMeasurementsBySensor } from "@services/measurementsService";
import { parseISODateParamToUTC } from "@utils";

export async function getMeasurementsBySensor(
    networkCode: string, 
    gatewayMac: string,
    sensorMac : string,
    startDate?: string,
    endDate? : string
) : Promise<MeasurementsDTO>{

    const measurementRepo = new MeasurementRepository();

    const startDateISOUTC = parseISODateParamToUTC(startDate); 
    const endDateISOUTC = parseISODateParamToUTC(endDate);

    const sensorMeasurements = await measurementRepo.getMeasurementsBySensor(networkCode, gatewayMac, sensorMac, startDateISOUTC, endDateISOUTC);
    const stats = calcStats(sensorMeasurements);
  
    const processedMeasurements = processMeasurements(sensorMeasurements, stats.upperThreshold, stats.lowerThreshold);

    return MeasurementsToJSON(
        createMeasurementsDTO(
            sensorMac, 
            createStatsDTO(stats.mean,stats.variance, stats.upperThreshold, stats.lowerThreshold,startDateISOUTC,endDateISOUTC),
            processedMeasurements.map(([m, isOutlier]) =>  mapMeasurementDAOToDTO(m, isOutlier))
        )
    )    
}

export async function storeMeasurement(
    networkCode:string, 
    gatewayMac: string,
    sensorMac: string, 
    measurements : MeasurementDTO[]
) : Promise<void> {    
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
    sensorMac : string,
    startDate?: string,
    endDate? : string
) : Promise<StatsDTO> {
    const measurementRepo = new MeasurementRepository();

    const startDateISOUTC = parseISODateParamToUTC(startDate); 
    const endDateISOUTC = parseISODateParamToUTC(endDate);

    const sensorMeasurements = await measurementRepo.getMeasurementsBySensor(networkCode, gatewayMac, sensorMac, startDateISOUTC, endDateISOUTC);
    const stats = calcStats(sensorMeasurements);

    return createStatsDTO(stats.mean,stats.variance, stats.upperThreshold, stats.lowerThreshold,startDateISOUTC,endDateISOUTC)

}

export async function getOutliersBySensor(
    networkCode: string, 
    gatewayMac: string,
    sensorMac : string,
    startDate?: string,
    endDate? : string
) : Promise<MeasurementsDTO>{

    const measurementRepo = new MeasurementRepository();

    const startDateISOUTC = parseISODateParamToUTC(startDate); 
    const endDateISOUTC = parseISODateParamToUTC(endDate);

    const sensorMeasurements = await measurementRepo.getMeasurementsBySensor(networkCode, gatewayMac, sensorMac, startDateISOUTC, endDateISOUTC);
    const stats = calcStats(sensorMeasurements);
  
    const processedMeasurements = processMeasurements(sensorMeasurements, stats.upperThreshold, stats.lowerThreshold);

    return MeasurementsToJSON(
        createMeasurementsDTO(
            sensorMac, 
            createStatsDTO(stats.mean,stats.variance, stats.upperThreshold, stats.lowerThreshold,startDateISOUTC,endDateISOUTC),
            processedMeasurements
            .filter(([m, isOutlier]) => isOutlier)
            .map(([m, isOutlier]) => mapMeasurementDAOToDTO(m, isOutlier))
        )
    )    
}

export async function getMeasuramentsByNetwork(
    networkCode: string,
    sensorMac?: string[],
    startDate?: string,
    endDate?: string
  ): Promise<MeasurementsDTO[]> {
    const measurementRepo = new MeasurementRepository();

    const startDateISOUTC = parseISODateParamToUTC(startDate);
    const endDateISOUTC = parseISODateParamToUTC(endDate);

    const sensorMeasurements = await measurementRepo.getMeasurementsByNetwork(networkCode, sensorMac, startDateISOUTC, endDateISOUTC);    
    const groupedMeasurements = groupMeasurementsBySensor(sensorMeasurements);


    return Object.entries(groupedMeasurements).map(([sensorMac, measurements]) => {
        const stats = calcStats(measurements);
        const processed = processMeasurements(measurements, stats.upperThreshold, stats.lowerThreshold);

        return createMeasurementsDTO(
            sensorMac,
            createStatsDTO(stats.mean, stats.variance, stats.upperThreshold, stats.lowerThreshold, startDateISOUTC, endDateISOUTC),
            processed.map(([m, isOutlier]) => mapMeasurementDAOToDTO(m, isOutlier))
        )
    
    });
} 

//FIXME: viene bloccato dal validatore di rete
export async function getStatisticsByNetwork(
    networkCode: string, 
    sensorMac?: string[], 
    startDate?: string, 
    endDate?: string
): Promise<StatsDTO[]> {
    const measurementRepo = new MeasurementRepository();

    const startDateISOUTC = parseISODateParamToUTC(startDate);
    const endDateISOUTC = parseISODateParamToUTC(endDate);

    const sensorMeasurements = await measurementRepo.getMeasurementsByNetwork(networkCode, sensorMac, startDateISOUTC, endDateISOUTC);
    const stats = calcStats(sensorMeasurements);    
    const groupedMeasurements = groupMeasurementsBySensor(sensorMeasurements);

    return Object.entries(groupedMeasurements).map(([sensorMac, measurements]) => {
        return createStatsDTO(stats.mean, stats.variance, stats.upperThreshold, stats.lowerThreshold, startDateISOUTC, endDateISOUTC);
    });
}


export async function getOutliersByNetwork(networkCode: string, sensorMac?: string[], startDate?: string, endDate?: string): Promise<MeasurementsDTO[]> {
    const measurementRepo = new MeasurementRepository();

    const startDateISOUTC = parseISODateParamToUTC(startDate);
    const endDateISOUTC = parseISODateParamToUTC(endDate);
    const sensorMeasurements = await measurementRepo.getMeasurementsByNetwork(networkCode, sensorMac, startDateISOUTC, endDateISOUTC);
    const groupedMeasurements = groupMeasurementsBySensor(sensorMeasurements);
   

    return Object.entries(groupedMeasurements).map(([sensorMac, measurements]) => {
        const stats = calcStats(measurements);
        const processed = processMeasurements(measurements, stats.upperThreshold, stats.lowerThreshold);
        return createMeasurementsDTO(
            sensorMac,
            createStatsDTO(stats.mean, stats.variance, stats.upperThreshold, stats.lowerThreshold, startDateISOUTC, endDateISOUTC),
            processed
                .filter(([m, isOutlier]) => isOutlier)
                .map(([m, isOutlier]) => mapMeasurementDAOToDTO(m, isOutlier))
        );
    });

}