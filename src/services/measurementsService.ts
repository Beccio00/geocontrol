import { MeasurementDAO } from "@models/dao/MeasurementDAO";
import { MeasurementsToJSON } from "@models/dto/Measurements";
import { MeasurementRepository } from "@repositories/MeasurementRepository";
import { parseISODateParamToUTC } from "@utils";
import { Measurements as MeasurementsDTO } from "@models/dto/Measurements";
import { createMeasurementsDTO, createStatsDTO, mapMeasurementDAOToDTO } from "./mapperService";

export function processMeasurements(measurements : MeasurementDAO[], upperThreshold : number, lowerThreshold : number){
    return measurements.map(m => {
        const isOutlier = m.value < lowerThreshold || m.value > upperThreshold;
        return [m, isOutlier] as [MeasurementDAO, boolean];
    });
}

export  function calcStats(measurements : MeasurementDAO[]){
    if (measurements.length === 0) {
        return {
            mean: 0.00,
            variance: 0.00,
            upperThreshold: 0.00,
            lowerThreshold: 0.00,
        };
    }
    const values = measurements.map(m => m.value);
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;

    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;

    const stdDev = Math.sqrt(variance);

    const upperThreshold = mean + 2 * stdDev;
    const lowerThreshold = mean - 2 * stdDev;

    // Funzione helper per arrotondare a 2 decimali
    const round2 = (num: number) => Math.round(num * 100) / 100;

    return {
        mean: round2(mean),
        variance: round2(variance),
        upperThreshold: round2(upperThreshold),
        lowerThreshold: round2(lowerThreshold),
    };
}

//fixme togli
export function groupMeasurementsBySensor(measurements: MeasurementDAO[]): Record<string, MeasurementDAO[]> {
    const groupedMeasurements: Record<string, MeasurementDAO[]> = {};
    measurements.forEach(measurement => {
        const sensorMac = measurement.sensor.macAddress;
        if (!groupedMeasurements[sensorMac]) {
            groupedMeasurements[sensorMac] = [];
        }
        groupedMeasurements[sensorMac].push(measurement);
        return groupedMeasurements;
    });
    return groupedMeasurements;
}


export function initializeRepositoryAndDates(startDate?: string, endDate?: string) {
    return {
        measurementRepo: new MeasurementRepository(),
        startDateISOUTC: parseISODateParamToUTC(startDate),
        endDateISOUTC: parseISODateParamToUTC(endDate)
    };
}

export function processSensorMeasurements(
    sensorMac: string,
    measurements: any[],
    startDateISOUTC?: Date,
    endDateISOUTC?: Date,
    filterOutliers: boolean = false
): MeasurementsDTO {
    const stats = calcStats(measurements);
    const processedMeasurements = processMeasurements(measurements, stats.upperThreshold, stats.lowerThreshold);
    
    let filteredMeasurements = processedMeasurements;
    if (filterOutliers) {
        filteredMeasurements = processedMeasurements.filter(([m, isOutlier]) => isOutlier);
    }

    return MeasurementsToJSON(
        createMeasurementsDTO(
            sensorMac,
            createStatsDTO(stats.mean, stats.variance, stats.upperThreshold, stats.lowerThreshold, startDateISOUTC, endDateISOUTC),
            filteredMeasurements.map(([m, isOutlier]) => mapMeasurementDAOToDTO(m, isOutlier))
        )
    );
}


export function processNetworkMeasurements(
    groupedMeasurements: { [key: string]: any[] },
    startDateISOUTC?: Date,
    endDateISOUTC?: Date,
    filterOutliers: boolean = false
): MeasurementsDTO[] {
    return Object.entries(groupedMeasurements).map(([sensorMac, measurements]) => {
        return processSensorMeasurements(sensorMac, measurements, startDateISOUTC, endDateISOUTC, filterOutliers);
    });
}