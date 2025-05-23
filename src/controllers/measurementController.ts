import { getMeasurementsBySensorsAndNetwork, getMeasurementsBySensor, getSensorStats, getNetworkStats, getNetworkOutliers, getSensorOutliers, storeMeasurements, createMeasurement,} from "@services/measurementsService";
import {Measurement as MeasurementDTO} from "@dto/Measurement";
import {Measurements as MeasurementsDTO} from "@dto/Measurements"
import {Stats} from "@dto/Stats";
import {MeasurementRepository} from "@repositories/MeasurementRepository";
import { mapMeasurementDAOToDTO, mapMeasurementsToDTO } from "@services/mapperService";

export async function getMeasuramentsByNetwork(
    networkCode: string,
    sensorMacs?: string[],
    startDate?: string,
    endDate?: string
): Promise<MeasurementsDTO[]> {
    const measurementRepo = new MeasurementRepository();

    const measurementsDAO = await measurementRepo.getMeasurementsByNetwork(
        networkCode,
        sensorMacs,
        startDate,
        endDate
    );
    return measurementsDAO.map(mapMeasurementsToDTO);
    
}