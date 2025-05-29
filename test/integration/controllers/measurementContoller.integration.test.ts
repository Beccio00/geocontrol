import * as measurementsController from "@controllers/measurementController";
import { MeasurementRepository } from "@repositories/MeasurementRepository";
import { GatewayRepository } from "@repositories/GatewayRepository";
import { NetworkRepository } from "@repositories/NetworkRepository";
import { MeasurementDAO } from "@dao/MeasurementDAO";
import { GatewayDAO } from "@dao/GatewayDAO";
import { NetworkDAO } from "@dao/NetworkDAO";
import { initializeTestDataSource, closeTestDataSource, TestDataSource } from "@test/setup/test-datasource";
import { Measurement as MeasurementDTO } from "@dto/Measurement";
import { Measurements as MeasurementsDTO } from "@dto/Measurements";
import { Stats as StatsDTO } from "@models/dto/Stats";
import { NotFoundError } from "@models/errors/NotFoundError";
import { Sensor } from "@models/dto/Sensor";
import { SensorDAO } from "@models/dao/SensorDAO";
import { SensorRepository } from "@repositories/SensorRepository";

describe("MeasurementsController integration", () => {
  const measurementRepo = new MeasurementRepository();
  const gatewayRepo = new GatewayRepository();
  const networkRepo = new NetworkRepository();
  const sensorRepo = new SensorRepository();
  
  const networkCode = "test-network";
  const gatewayMac = "00:11:22:33:44:55";
  const sensorMac = "AA:BB:CC:DD:EE:FF";
  const sensorMac2 = "11:22:33:44:55:66";

  beforeAll(async () => {
    await initializeTestDataSource();
  });

  afterAll(async () => {
    await closeTestDataSource();
  });

  beforeEach(async () => {
    await TestDataSource.getRepository(MeasurementDAO).clear();
    await TestDataSource.getRepository(GatewayDAO).clear();
    await TestDataSource.getRepository(NetworkDAO).clear();
    await TestDataSource.getRepository(SensorDAO).clear();
 
    await networkRepo.createNetwork(networkCode, "Test Network", "A test network", []);
    await gatewayRepo.createGateway(networkCode, gatewayMac, "Test Gateway", "A test gateway", []);
    await sensorRepo.createSensor(networkCode, gatewayMac, sensorMac, "Test Sensor", "A test sensor", "Test vairable", "Test unit");
    await sensorRepo.createSensor(networkCode, gatewayMac, sensorMac2, "Test Sensor2", "A test sensor2", "Test vairable2", "Test unit2");

  });

  describe("getMeasurementsBySensor", () => {
    it("getMeasurementsBySensor: should return measurements for a specific sensor", async () => {
        const testDate1 = new Date("2024-01-01T10:00:00Z");
        const testDate2 = new Date("2024-01-01T11:00:00Z");
        
        await measurementRepo.storeMeasurement(networkCode, gatewayMac, sensorMac, 25.5, testDate1);
        await measurementRepo.storeMeasurement(networkCode, gatewayMac, sensorMac, 26.0, testDate2);
    
        const result = await measurementsController.getMeasurementsBySensor(
          networkCode, 
          gatewayMac, 
          sensorMac
        );
    
        expect(result.sensorMacAddress).toBe(sensorMac);
        expect(result.measurements).toHaveLength(2);
        expect(result.stats).toBeDefined();
        expect(result.stats?.mean).toBeCloseTo(25.75);
    });
    
    it("getMeasurementsBySensor: should return measurements within date range", async () => {
    const testDate1 = new Date("2024-01-01T10:00:00Z");
    const testDate2 = new Date("2024-01-02T10:00:00Z");
    const testDate3 = new Date("2024-01-03T10:00:00Z");
    
    await measurementRepo.storeMeasurement(networkCode, gatewayMac, sensorMac, 25.0, testDate1);
    await measurementRepo.storeMeasurement(networkCode, gatewayMac, sensorMac, 26.0, testDate2);
    await measurementRepo.storeMeasurement(networkCode, gatewayMac, sensorMac, 27.0, testDate3);

    const result = await measurementsController.getMeasurementsBySensor(
        networkCode, 
        gatewayMac, 
        sensorMac,
        "2024-01-01",
        "2024-01-03" //because the string 2024-01-02 will convert in 2024-01-02IT00:00:00Z by parseISO() called in utils.ts
    );

    expect(result.measurements).toHaveLength(2); 
    expect(result.measurements?.map(m => m.value)).toEqual(expect.arrayContaining([25.0, 26.0])); 
    });

    it("should handle empty measurements gracefully", async () => {
    const result = await measurementsController.getMeasurementsBySensor(
        networkCode,
        gatewayMac,
        sensorMac
    );

    expect(result.sensorMacAddress).toBe(sensorMac);
    expect(result).not.toHaveProperty("measuraments");
    expect(result.stats).toBeUndefined();
    });

    it("should handle date range with no measurements", async () => {
    await measurementRepo.storeMeasurement(networkCode, gatewayMac, sensorMac, 25.0, new Date("2024-01-01T10:00:00Z"));

    const result = await measurementsController.getMeasurementsBySensor(
        networkCode,
        gatewayMac,
        sensorMac,
        "2024-02-01",
        "2024-02-02"
    );

    expect(result).not.toHaveProperty("measuraments");
    expect(result.stats).toBeUndefined();
    });
  });

  describe("storeMeasurement", () => {
    it("storeMeasurement: should store multiple measurements", async () => {
        const measurements: MeasurementDTO[] = [
          { value: 25.5, createdAt: new Date("2024-01-01T10:00:00Z") },
          { value: 26.0, createdAt: new Date("2024-01-01T11:00:00Z") },
          { value: 24.5, createdAt: new Date("2024-01-01T12:00:00Z") }
        ];
    
        await measurementsController.storeMeasurement(
          networkCode,
          gatewayMac,
          sensorMac,
          measurements
        );
    
        const storedMeasurements = await measurementRepo.getMeasurementsBySensor(
          networkCode, 
          gatewayMac, 
          sensorMac
        );
        expect(storedMeasurements).toHaveLength(3);
        expect(storedMeasurements.map(m => m.value)).toEqual(
          expect.arrayContaining([25.5, 26.0, 24.5])
        );
      });
  });

  describe("getStatisticsBySensor", () => {
      it("getStatisticsBySensor: should return statistics for a sensor", async () => {
    const values = [20.0, 22.0, 24.0, 26.0, 28.0];
    for (let i = 0; i < values.length; i++) {
      await measurementRepo.storeMeasurement(
        networkCode, 
        gatewayMac, 
        sensorMac, 
        values[i], 
        new Date(`2024-01-01T${10 + i}:00:00Z`)
      );
    }

    const result = await measurementsController.getStatisticsBySensor(
      networkCode,
      gatewayMac,
      sensorMac
    );

    expect(result.mean).toBeCloseTo(24.0);
    expect(result.variance).toBeCloseTo(8.0);
    expect(result.upperThreshold).toBeCloseTo(29.66, 1); 
    expect(result.lowerThreshold).toBeCloseTo(18.34, 1); 
  });
  });

  describe("getOutliersBySensor", () => {
    it("getOutliersBySensor: should return only outlier measurements", async () => {
        const normalValues = [20.0, 21.0, 22.0, 23.0, 24.0, 21.1, 20.3, 22.6, 20.0, 21.0, 22.0, 23.0, 24.0, 21.1, 20.3, 22.6, 20.0, 21.0, 22.0, 23.0, 24.0, 21.1, 20.3, 22.6]; 
        const outlierValues = [-10.0, 100.0]; 
        
        for (let i = 0; i < normalValues.length; i++) {
        await measurementRepo.storeMeasurement(
            networkCode, 
            gatewayMac, 
            sensorMac, 
            normalValues[i], 
            new Date(`2024-01-01T${10 + i}:00:00Z`)
        );
        }
        
        for (let i = 0; i < outlierValues.length; i++) {
        await measurementRepo.storeMeasurement(
            networkCode, 
            gatewayMac, 
            sensorMac, 
            outlierValues[i], 
            new Date(`2024-01-01T${20 + i}:00:00Z`)
        );
        }

        const result = await measurementsController.getOutliersBySensor(
        networkCode,
        gatewayMac,
        sensorMac
        );

        expect(result.measurements).toHaveLength(2);
        expect(result.measurements?.map(m => m.value)).toEqual(
        expect.arrayContaining([-10.0, 100.0])
        );
        expect(result.measurements?.every(m => m.isOutlier)).toBe(true);
    });
  });

  describe("getMeasuramentsByNetwork", () => {
    it("getMeasuramentsByNetwork: should return measurements for all sensors in network", async () => {
        await measurementRepo.storeMeasurement(networkCode, gatewayMac, sensorMac, 25.0, new Date("2024-01-01T10:00:00Z"));
        await measurementRepo.storeMeasurement(networkCode, gatewayMac, sensorMac, 26.0, new Date("2024-01-01T11:00:00Z"));
        await measurementRepo.storeMeasurement(networkCode, gatewayMac, sensorMac2, 30.0, new Date("2024-01-01T10:00:00Z"));
        await measurementRepo.storeMeasurement(networkCode, gatewayMac, sensorMac2, 31.0, new Date("2024-01-01T11:00:00Z"));
    
        const result = await measurementsController.getMeasuramentsByNetwork(networkCode);
    
        expect(result).toHaveLength(2);
        const sensorMacs = result.map(r => r.sensorMacAddress);
        expect(sensorMacs).toEqual(expect.arrayContaining([sensorMac, sensorMac2]));
        
        const sensor1Result = result.find(r => r.sensorMacAddress === sensorMac);
        const sensor2Result = result.find(r => r.sensorMacAddress === sensorMac2);
        
        expect(sensor1Result?.measurements).toHaveLength(2);
        expect(sensor2Result?.measurements).toHaveLength(2);
      });
    
    it("getMeasuramentsByNetwork: should filter by specific sensor MACs", async () => {
    await measurementRepo.storeMeasurement(networkCode, gatewayMac, sensorMac, 25.0, new Date("2024-01-01T10:00:00Z"));
    await measurementRepo.storeMeasurement(networkCode, gatewayMac, sensorMac2, 30.0, new Date("2024-01-01T10:00:00Z"));

    const result = await measurementsController.getMeasuramentsByNetwork(
        networkCode,
        [sensorMac]
    );

    expect(result).toHaveLength(1);
    expect(result[0].sensorMacAddress).toBe(sensorMac);
    });    
  });

  describe("getStatisticsByNetwork", () => {
    it("getStatisticsByNetwork: should return statistics for all sensors in network", async () => {
    await measurementRepo.storeMeasurement(networkCode, gatewayMac, sensorMac, 20.0, new Date("2024-01-01T10:00:00Z"));
    await measurementRepo.storeMeasurement(networkCode, gatewayMac, sensorMac, 24.0, new Date("2024-01-01T11:00:00Z"));
    await measurementRepo.storeMeasurement(networkCode, gatewayMac, sensorMac2, 30.0, new Date("2024-01-01T10:00:00Z"));
    await measurementRepo.storeMeasurement(networkCode, gatewayMac, sensorMac2, 34.0, new Date("2024-01-01T11:00:00Z"));

    const result = await measurementsController.getStatisticsByNetwork(networkCode);

    expect(result).toHaveLength(2);

    const sensor1Result = result.find(r => r.sensorMacAddress === sensorMac);
    const sensor2Result = result.find(r => r.sensorMacAddress === sensorMac2);

    expect(sensor1Result?.stats?.mean).toBeCloseTo(22.0);
    expect(sensor2Result?.stats?.mean).toBeCloseTo(32.0);

    expect(sensor1Result?.measurements).toBeUndefined();
    expect(sensor2Result?.measurements).toBeUndefined();
    });
  });

  describe("getOutliersByNetwork", () => {
    it("getOutliersByNetwork: should return outliers for all sensors in network", async () => {
        await measurementRepo.storeMeasurement(networkCode, gatewayMac, sensorMac, 20.0, new Date("2024-01-01T10:00:00Z"));
        await measurementRepo.storeMeasurement(networkCode, gatewayMac, sensorMac, 22.0, new Date("2024-01-01T11:00:00Z"));
        await measurementRepo.storeMeasurement(networkCode, gatewayMac, sensorMac, 24.0, new Date("2024-01-01T12:00:00Z"));
        await measurementRepo.storeMeasurement(networkCode, gatewayMac, sensorMac, 20.0, new Date("2024-01-01T10:00:00Z"));
        await measurementRepo.storeMeasurement(networkCode, gatewayMac, sensorMac, 22.0, new Date("2024-01-01T11:00:00Z"));
        await measurementRepo.storeMeasurement(networkCode, gatewayMac, sensorMac, 24.0, new Date("2024-01-01T12:00:00Z"));
        await measurementRepo.storeMeasurement(networkCode, gatewayMac, sensorMac, 20.0, new Date("2024-01-01T10:00:00Z"));
        await measurementRepo.storeMeasurement(networkCode, gatewayMac, sensorMac, 22.0, new Date("2024-01-01T11:00:00Z"));
        await measurementRepo.storeMeasurement(networkCode, gatewayMac, sensorMac, 24.0, new Date("2024-01-01T12:00:00Z"));
        await measurementRepo.storeMeasurement(networkCode, gatewayMac, sensorMac, 1.0, new Date("2024-01-01T13:00:00Z")); // outlier
        
        await measurementRepo.storeMeasurement(networkCode, gatewayMac, sensorMac2, 30.0, new Date("2024-01-01T10:00:00Z"));
        await measurementRepo.storeMeasurement(networkCode, gatewayMac, sensorMac2, 32.0, new Date("2024-01-01T11:00:00Z"));
        await measurementRepo.storeMeasurement(networkCode, gatewayMac, sensorMac2, 34.0, new Date("2024-01-01T12:00:00Z"));
        await measurementRepo.storeMeasurement(networkCode, gatewayMac, sensorMac2, 30.0, new Date("2024-01-01T10:00:00Z"));
        await measurementRepo.storeMeasurement(networkCode, gatewayMac, sensorMac2, 32.0, new Date("2024-01-01T11:00:00Z"));
        await measurementRepo.storeMeasurement(networkCode, gatewayMac, sensorMac2, 34.0, new Date("2024-01-01T12:00:00Z"));
        await measurementRepo.storeMeasurement(networkCode, gatewayMac, sensorMac2, 30.0, new Date("2024-01-01T10:00:00Z"));
        await measurementRepo.storeMeasurement(networkCode, gatewayMac, sensorMac2, 32.0, new Date("2024-01-01T11:00:00Z"));
        await measurementRepo.storeMeasurement(networkCode, gatewayMac, sensorMac2, 34.0, new Date("2024-01-01T12:00:00Z"));
        await measurementRepo.storeMeasurement(networkCode, gatewayMac, sensorMac2, 510.0, new Date("2024-01-01T13:00:00Z")); // outlier
    
        const result = await measurementsController.getOutliersByNetwork(networkCode);
    
        expect(result).toHaveLength(2);
        
        const sensor1Result = result.find(r => r.sensorMacAddress === sensorMac);
        const sensor2Result = result.find(r => r.sensorMacAddress === sensorMac2);
        
       expect(sensor1Result?.measurements).toHaveLength(1);
        expect(sensor1Result?.measurements?.[0].value).toBe(1.0);
        expect(sensor1Result?.measurements?.[0].isOutlier).toBe(true);
        
        expect(sensor2Result?.measurements).toHaveLength(1);
        expect(sensor2Result?.measurements?.[0].value).toBe(510.0);
        expect(sensor2Result?.measurements?.[0].isOutlier).toBe(true);
    });
  });
});