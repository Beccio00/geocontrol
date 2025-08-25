import { MeasurementDAO } from '@models/dao/MeasurementDAO';
import { MeasurementRepository } from '@repositories/MeasurementRepository';
import { parseISODateParamToUTC } from '@utils';
import { createMeasurementsDTO, createStatsDTO, mapMeasurementDAOToDTO } from '@services/mapperService';
import { MeasurementsToJSON } from '@models/dto/Measurements';
import { 
    calcStats, 
    initializeRepositoryAndDates, 
    processSensorMeasurements 
} from '@services/measurementsService';

jest.mock('@repositories/MeasurementRepository');
jest.mock('@utils');
jest.mock('@services/mapperService');
jest.mock('@models/dto/Measurements');

describe('MeasurementService', () => {    
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('calcStats', () => {
        it('should return zero stats for empty measurements array', () => {
            const result = calcStats([]);
            
            expect(result).toEqual({
                mean: 0.00,
                variance: 0.00,
                upperThreshold: 0.00,
                lowerThreshold: 0.00,
            });
        });

        it('should calculate correct stats for multiple measurements', () => {
            const measurements: MeasurementDAO[] = [
                { id: 1, value: 10, createdAt: new Date()} as MeasurementDAO,
                { id: 2, value: 20, createdAt: new Date()} as MeasurementDAO,
                { id: 3, value: 30, createdAt: new Date()} as MeasurementDAO
            ];
            
            const result = calcStats(measurements);
            
            // Mean = 20, Variance = 66.67, StdDev = 8.16, Thresholds = 20 ± 16.33
            expect(result.mean).toBe(20.00);
            expect(result.variance).toBe(66.67);
            expect(result.upperThreshold).toBe(36.33);
            expect(result.lowerThreshold).toBe(3.67);
        });

        it('should round values to 2 decimal places', () => {
            const measurements: MeasurementDAO[] = [
                { id: 1, value: 10.333, createdAt: new Date()} as MeasurementDAO,
                { id: 2, value: 20.666, createdAt: new Date()} as MeasurementDAO
            ];
            
            const result = calcStats(measurements);
            
            expect(result.mean).toBe(15.50);
            expect(Number.isInteger(result.variance * 100)).toBe(true);
            expect(Number.isInteger(result.upperThreshold * 100)).toBe(true);
            expect(Number.isInteger(result.lowerThreshold * 100)).toBe(true);
        });
    });

    describe('initializeRepositoryAndDates', () => {
        const mockParseISODateParamToUTC = parseISODateParamToUTC as jest.MockedFunction<typeof parseISODateParamToUTC>;
        const mockMeasurementRepository = MeasurementRepository as jest.MockedClass<typeof MeasurementRepository>;

        it('should initialize repository and parse dates', () => {
            const startDate = '2025-01-18T16:00:00+01:00';
            const endDate = '2025-01-18T17:00:00+01:00';
            const mockStartDateUTC = new Date('2025-01-18T15:00:00.000Z');
            const mockEndDateUTC = new Date('2025-01-18T16:00:00.000Z');
            
            mockParseISODateParamToUTC
                .mockReturnValueOnce(mockStartDateUTC)
                .mockReturnValueOnce(mockEndDateUTC);
            
            const result = initializeRepositoryAndDates(startDate, endDate);
            
            expect(mockParseISODateParamToUTC).toHaveBeenCalledWith(startDate);
            expect(mockParseISODateParamToUTC).toHaveBeenCalledWith(endDate);
            expect(mockMeasurementRepository).toHaveBeenCalled();
            expect(result.startDateISOUTC).toBe(mockStartDateUTC);
            expect(result.endDateISOUTC).toBe(mockEndDateUTC);
            expect(result.measurementRepo).toBeInstanceOf(MeasurementRepository);
        });

        it('should handle undefined dates', () => {
            mockParseISODateParamToUTC
                .mockReturnValueOnce(undefined)
                .mockReturnValueOnce(undefined);
            
            const result = initializeRepositoryAndDates();
            
            expect(mockParseISODateParamToUTC).toHaveBeenCalledWith(undefined);
            expect(result.startDateISOUTC).toBeUndefined();
            expect(result.endDateISOUTC).toBeUndefined();
        });
    });

    describe('processSensorMeasurements', () => {
        const mockCreateMeasurementsDTO = createMeasurementsDTO as jest.MockedFunction<typeof createMeasurementsDTO>;
        const mockCreateStatsDTO = createStatsDTO as jest.MockedFunction<typeof createStatsDTO>;
        const mockMapMeasurementDAOToDTO = mapMeasurementDAOToDTO as jest.MockedFunction<typeof mapMeasurementDAOToDTO>;
        const mockMeasurementsToJSON = MeasurementsToJSON as jest.MockedFunction<typeof MeasurementsToJSON>;

        const sampleMeasurements: MeasurementDAO[] = [
            { id: 1, value: 10, createdAt: new Date()} as MeasurementDAO,
            { id: 2, value: 10, createdAt: new Date()} as MeasurementDAO,
            { id: 3, value: 10, createdAt: new Date()} as MeasurementDAO,
            { id: 4, value: 10, createdAt: new Date()} as MeasurementDAO,
            { id: 5, value: 10, createdAt: new Date()} as MeasurementDAO,
            { id: 6, value: 10, createdAt: new Date()} as MeasurementDAO,
            { id: 7, value: 10, createdAt: new Date()} as MeasurementDAO,
            { id: 8, value: 10, createdAt: new Date()} as MeasurementDAO,
            { id: 9, value: 100, createdAt: new Date()} as MeasurementDAO // outlier
        ];

        beforeEach(() => {
            mockCreateMeasurementsDTO.mockReturnValue({} as any);
            mockCreateStatsDTO.mockReturnValue({} as any);
            mockMapMeasurementDAOToDTO.mockReturnValue({} as any);
            mockMeasurementsToJSON.mockReturnValue({} as any);
        });

        it('should process measurements with default parameters', () => {
            const sensorMac = 'AA:BB:CC:DD:EE:FF';
            
            processSensorMeasurements(sensorMac, sampleMeasurements);
            
            expect(mockCreateStatsDTO).toHaveBeenCalledWith(
                expect.any(Number), // mean
                expect.any(Number), // variance
                expect.any(Number), // upperThreshold
                expect.any(Number), // lowerThreshold
                undefined, // startDate
                undefined  // endDate
            );
            expect(mockCreateMeasurementsDTO).toHaveBeenCalledWith(
                sensorMac,
                expect.any(Object), // stats
                expect.any(Array)   // measurements
            );
            expect(mockMeasurementsToJSON).toHaveBeenCalled();
        });

        it('should handle empty measurements array', () => {
            const sensorMac = 'AA:BB:CC:DD:EE:FF';
            
            processSensorMeasurements(sensorMac, []);
            
            expect(mockCreateMeasurementsDTO).toHaveBeenCalledWith(
                sensorMac,
                expect.any(Object), // stats
                undefined  // no measurements
            );
        });

        it('should exclude measurements when includeMeasurements is false', () => {
            const sensorMac = 'AA:BB:CC:DD:EE:FF';
            
            processSensorMeasurements(sensorMac, sampleMeasurements, undefined, undefined, false);
            
            expect(mockCreateMeasurementsDTO).toHaveBeenCalledWith(
                sensorMac,
                expect.any(Object), // stats
                undefined           // no measurements
            );
        });

        it('should filter outliers when filterOutliers is true', () => {
            const sensorMac = 'AA:BB:CC:DD:EE:FF';
            
            processSensorMeasurements(sensorMac, sampleMeasurements, undefined, undefined, true, true);            
            
            expect(mockMapMeasurementDAOToDTO).toHaveBeenCalled();
            expect(mockCreateMeasurementsDTO).toHaveBeenCalledWith(
                sensorMac,
                expect.any(Object),
                expect.any(Array)
            );
        });

        it('should include start and end dates in stats when provided', () => {
            const sensorMac = 'AA:BB:CC:DD:EE:FF';
            const startDate = new Date('2025-01-18T15:00:00.000Z');
            const endDate = new Date('2025-01-18T16:00:00.000Z');
            
            processSensorMeasurements(sensorMac, sampleMeasurements, startDate, endDate);
            
            expect(mockCreateStatsDTO).toHaveBeenCalledWith(
                expect.any(Number),
                expect.any(Number),
                expect.any(Number),
                expect.any(Number),
                startDate,
                endDate
            );
        });

        it('should process measurements with all parameters', () => {
            const sensorMac = 'AA:BB:CC:DD:EE:FF';
            const startDate = new Date('2025-01-18T15:00:00.000Z');
            const endDate = new Date('2025-01-18T16:00:00.000Z')
            
            processSensorMeasurements(
                sensorMac, 
                sampleMeasurements, 
                startDate, 
                endDate, 
                true, 
                false
            );
            
            expect(mockCreateStatsDTO).toHaveBeenCalledWith(
                expect.any(Number),
                expect.any(Number),
                expect.any(Number),
                expect.any(Number),
                startDate,
                endDate
            );
            
            expect(mockMapMeasurementDAOToDTO).toHaveBeenCalledTimes(9);
            expect(mockCreateMeasurementsDTO).toHaveBeenCalledWith(
                sensorMac,
                expect.any(Object),
                expect.any(Array)
            );
            
            expect(mockMeasurementsToJSON).toHaveBeenCalled();
        });
    });
});