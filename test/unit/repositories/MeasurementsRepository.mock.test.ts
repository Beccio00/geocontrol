import { MeasurementRepository } from "@repositories/MeasurementRepository";
import { MeasurementDAO } from "@models/dao/MeasurementDAO";
import { NetworkDAO } from "@models/dao/NetworkDAO";
import { GatewayDAO } from "@models/dao/GatewayDAO";
import { SensorDAO } from "@dao/SensorDAO";
import { NotFoundError } from "@models/errors/NotFoundError";

const mockMeasurementFind = jest.fn();
const mockMeasurementSave = jest.fn();
const mockNetworkFind = jest.fn();
const mockGatewayFind = jest.fn();
const mockSensorFind = jest.fn();

jest.mock("@database", () => ({
  AppDataSource: {
    getRepository: jest.fn((entity) => {
      if (entity === MeasurementDAO) {
        return {
          find: mockMeasurementFind,
          save: mockMeasurementSave
        };
      }
      if (entity === NetworkDAO) {
        return {
          find: mockNetworkFind
        };
      }
      if (entity === GatewayDAO) {
        return {
          find: mockGatewayFind
        };
      }
      if (entity === SensorDAO) {
        return {
          find: mockSensorFind
        };
      }
    })
  }
}));

describe("MeasurementRepository: mocked database", () => {
  const repo = new MeasurementRepository();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("storeMeasurement", () => {
    it("should store measurement successfully", async () => {
      const network = new NetworkDAO();
      network.code = "NET001";
      mockNetworkFind.mockResolvedValue([network]);

      const gateway = new GatewayDAO();
      gateway.macAddress = "AA:BB:CC:DD:EE:FF";
      mockGatewayFind.mockResolvedValue([gateway]);

      const sensor = new SensorDAO();
      sensor.macAddress = "11:22:33:44:55:66";
      mockSensorFind.mockResolvedValue([sensor]);

      const savedMeasurement = new MeasurementDAO();
      savedMeasurement.value = 25.5;
      savedMeasurement.createdAt = new Date();
      savedMeasurement.sensor = sensor;
      mockMeasurementSave.mockResolvedValue(savedMeasurement);

      const result = await repo.storeMeasurement(
        "NET001",
        "AA:BB:CC:DD:EE:FF",
        "11:22:33:44:55:66",
        25.5,
        new Date()
      );

      expect(result).toBeInstanceOf(MeasurementDAO);
      expect(result.value).toBe(25.5);
      expect(result.sensor).toBe(sensor);
      expect(mockMeasurementSave).toHaveBeenCalledWith({
        value: 25.5,
        createdAt: expect.any(Date),
        sensor
      });
    });

    it("should throw NotFoundError when network not found", async () => {
      mockNetworkFind.mockResolvedValue([]);

      await expect(
        repo.storeMeasurement(
          "INVALID_NET",
          "AA:BB:CC:DD:EE:FF",
          "11:22:33:44:55:66",
          25.5,
          new Date()
        )
      ).rejects.toThrow(NotFoundError);
    });

    it("should throw NotFoundError when gateway not found", async () => {
      const network = new NetworkDAO();
      network.code = "NET001";
      mockNetworkFind.mockResolvedValue([network]);
      mockGatewayFind.mockResolvedValue([]);

      await expect(
        repo.storeMeasurement(
          "NET001",
          "INVALID_GATEWAY",
          "11:22:33:44:55:66",
          25.5,
          new Date()
        )
      ).rejects.toThrow(NotFoundError);
    });

    it("should throw NotFoundError when sensor not found", async () => {
      const network = new NetworkDAO();
      network.code = "NET001";
      mockNetworkFind.mockResolvedValue([network]);

      const gateway = new GatewayDAO();
      gateway.macAddress = "AA:BB:CC:DD:EE:FF";
      mockGatewayFind.mockResolvedValue([gateway]);

      mockSensorFind.mockResolvedValue([]);

      await expect(
        repo.storeMeasurement(
          "NET001",
          "AA:BB:CC:DD:EE:FF",
          "INVALID_SENSOR",
          25.5,
          new Date()
        )
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("getMeasurementsBySensor", () => {
    it("should get measurements by sensor with date range", async () => {
      // Mock validations
      const network = new NetworkDAO();
      network.code = "NET001";
      mockNetworkFind.mockResolvedValue([network]);

      const gateway = new GatewayDAO();
      gateway.macAddress = "AA:BB:CC:DD:EE:FF";
      mockGatewayFind.mockResolvedValue([gateway]);

      const sensor = new SensorDAO();
      sensor.macAddress = "11:22:33:44:55:66";
      mockSensorFind.mockResolvedValue([sensor]);

      // Mock measurements
      const measurements = [
        { value: 25.5, createdAt: new Date(), sensor },
        { value: 26.0, createdAt: new Date(), sensor }
      ];
      mockMeasurementFind.mockResolvedValue(measurements);

      const startDate = new Date("2024-01-01");
      const endDate = new Date("2024-01-31");

      const result = await repo.getMeasurementsBySensor(
        "NET001",
        "AA:BB:CC:DD:EE:FF",
        "11:22:33:44:55:66",
        startDate,
        endDate
      );

      expect(result).toHaveLength(2);
      expect(mockMeasurementFind).toHaveBeenCalledWith({
        where: expect.objectContaining({
          sensor: expect.objectContaining({
            macAddress: "11:22:33:44:55:66"
          }),
          createdAt: expect.any(Object) // Between clause
        })
      });
    });

    it("should get measurements without date range", async () => {
      // Mock validations
      const network = new NetworkDAO();
      network.code = "NET001";
      mockNetworkFind.mockResolvedValue([network]);

      const gateway = new GatewayDAO();
      gateway.macAddress = "AA:BB:CC:DD:EE:FF";
      mockGatewayFind.mockResolvedValue([gateway]);

      const sensor = new SensorDAO();
      sensor.macAddress = "11:22:33:44:55:66";
      mockSensorFind.mockResolvedValue([sensor]);

      const measurements = [{ value: 25.5, createdAt: new Date(), sensor }];
      mockMeasurementFind.mockResolvedValue(measurements);

      const result = await repo.getMeasurementsBySensor(
        "NET001",
        "AA:BB:CC:DD:EE:FF",
        "11:22:33:44:55:66"
      );

      expect(result).toHaveLength(1);
      expect(mockMeasurementFind).toHaveBeenCalledWith({
        where: expect.objectContaining({
          sensor: expect.objectContaining({
            macAddress: "11:22:33:44:55:66"
          })
        })
      });
    });
  });

  describe("getMeasurementsByNetwork", () => {
    it("should get measurements by network", async () => {
      // Mock network
      const network = new NetworkDAO();
      network.code = "NET001";
      mockNetworkFind.mockResolvedValue([network]);

      // Mock gateways
      const gateway = new GatewayDAO();
      gateway.id = 1;
      gateway.macAddress = "AA:BB:CC:DD:EE:FF";
      mockGatewayFind.mockResolvedValue([gateway]);

      // Mock sensors
      const sensor = new SensorDAO();
      sensor.id = 1;
      sensor.macAddress = "11:22:33:44:55:66";
      mockSensorFind.mockResolvedValue([sensor]);

      // Mock measurements
      const measurement = new MeasurementDAO();
      measurement.value = 25.5;
      measurement.createdAt = new Date();
      measurement.sensor = sensor;
      mockMeasurementFind.mockResolvedValue([measurement]);

      const result = await repo.getMeasurementsByNetwork("NET001");

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        sensorMac: "11:22:33:44:55:66",
        measurements: expect.arrayContaining([
          expect.objectContaining({ value: 25.5 })
        ])
      });
    });

    it("should return empty array when no gateways found", async () => {
      const network = new NetworkDAO();
      network.code = "NET001";
      mockNetworkFind.mockResolvedValue([network]);
      mockGatewayFind.mockResolvedValue([]);

      const result = await repo.getMeasurementsByNetwork("NET001");

      expect(result).toEqual([]);
    });

    it("should throw NotFoundError when network not found", async () => {
      mockNetworkFind.mockResolvedValue([]);

      await expect(
        repo.getMeasurementsByNetwork("INVALID_NET")
      ).rejects.toThrow(NotFoundError);
    });
  });
});
