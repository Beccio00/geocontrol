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
      const network = new NetworkDAO();
      network.code = "NET001";
      mockNetworkFind.mockResolvedValue([network]);

      const gateway = new GatewayDAO();
      gateway.macAddress = "AA:BB:CC:DD:EE:FF";
      mockGatewayFind.mockResolvedValue([gateway]);

      const sensor = new SensorDAO();
      sensor.macAddress = "11:22:33:44:55:66";
      mockSensorFind.mockResolvedValue([sensor]);

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

      expect(mockMeasurementFind).toHaveBeenCalledWith({
        where: {
          sensor: {
            macAddress: "11:22:33:44:55:66",
            gateway: {
              macAddress: "AA:BB:CC:DD:EE:FF",
              network: {
                code: "NET001"
              }
            }
          },
          createdAt: expect.objectContaining({
            _type: "between",
            _value: [startDate, endDate]
          })
        },
        order: { createdAt: "ASC" }
      });
  
      expect(result).toEqual(measurements);
    });

    it("should get measurements without date range", async () => {
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
        where: {
          sensor: {
            macAddress: "11:22:33:44:55:66",
            gateway: {
              macAddress: "AA:BB:CC:DD:EE:FF",
              network: {
                code: "NET001"
              }
            }
          },
          createdAt: undefined
        },
        order: { createdAt: "ASC" }
      });
    });
  });

  describe("getMeasurementsByNetwork", () => {
    it("should get measurements by network without dates and macs", async () => {
      const network = new NetworkDAO();
      network.code = "NET001";
      mockNetworkFind.mockResolvedValue([network]);

      const gateway = new GatewayDAO();
      gateway.macAddress = "AA:BB:CC:DD:EE:FF";
      mockGatewayFind.mockResolvedValue([gateway]);

      const sensor = new SensorDAO();
      sensor.macAddress = "11:22:33:44:55:66";
      mockSensorFind.mockResolvedValue([sensor]);

      const measurements = [
        { value: 25.5, createdAt: new Date(), sensor },
        { value: 26.0, createdAt: new Date(), sensor }
      ];
      mockMeasurementFind.mockResolvedValue(measurements);

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

    it("should get measurements by network with specific sensor MACs", async () => {
      const network = new NetworkDAO();
      network.code = "NET001";
      mockNetworkFind.mockResolvedValue([network]);
    
      const gateway = new GatewayDAO();
      gateway.macAddress = "AA:BB:CC:DD:EE:FF";
      mockGatewayFind.mockResolvedValue([gateway]);
    
      const sensor1 = new SensorDAO();
      sensor1.macAddress = "11:22:33:44:55:66";
      
      const sensor2 = new SensorDAO();
      sensor2.macAddress = "77:88:99:AA:BB:CC";
      
      mockSensorFind.mockResolvedValue([sensor1, sensor2]);
    
      const measurements = [
        { value: 25.5, createdAt: new Date(), sensor: sensor1 },
        { value: 26.0, createdAt: new Date(), sensor: sensor2 }
      ];
      mockMeasurementFind.mockResolvedValue(measurements);
    
      const result = await repo.getMeasurementsByNetwork(
        "NET001", 
        ["11:22:33:44:55:66", "77:88:99:AA:BB:CC"]
      );
    
      expect(mockSensorFind).toHaveBeenCalledWith({
        where: {
          gateway: { id: expect.any(Object) }, 
          macAddress: expect.any(Object) 
        }
      });
    
      expect(result).toHaveLength(2);
      expect(result).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            sensorMac: "11:22:33:44:55:66",
            measurements: expect.any(Array)
          }),
          expect.objectContaining({
            sensorMac: "77:88:99:AA:BB:CC", 
            measurements: expect.any(Array)
          })
        ])
      );
    });
    
    it("should get measurements by network with date range", async () => {
      const network = new NetworkDAO();
      network.code = "NET001";
      
      mockNetworkFind.mockResolvedValue([network]);
    
      const gateway = new GatewayDAO();
      
      gateway.macAddress = "AA:BB:CC:DD:EE:FF";
      mockGatewayFind.mockResolvedValue([gateway]);
    
      const sensor = new SensorDAO();
      
      sensor.macAddress = "11:22:33:44:55:66";
      mockSensorFind.mockResolvedValue([sensor]);
    
      const measurements = [
        { value: 25.5, createdAt: new Date("2024-01-15"), sensor }
      ];
      mockMeasurementFind.mockResolvedValue(measurements);
    
      const startDate = new Date("2024-01-01");
      const endDate = new Date("2024-01-31");
    
      const result = await repo.getMeasurementsByNetwork(
        "NET001",
        undefined,
        startDate,
        endDate
      );
    
      expect(mockMeasurementFind).toHaveBeenCalledWith({
        where: {
          sensor: { id: expect.any(Object) },
          createdAt: expect.objectContaining({
            _type: "between",
            _value: [startDate, endDate]
          })
        },
        order: { createdAt: "ASC" },
        relations: { sensor: true }
      });
    
      expect(result).toHaveLength(1);
    });
    
    it("should get measurements by network with only start date", async () => {
      const network = new NetworkDAO();
      network.code = "NET001";
      
      mockNetworkFind.mockResolvedValue([network]);
    
      const gateway = new GatewayDAO();
      
      gateway.macAddress = "AA:BB:CC:DD:EE:FF";
      mockGatewayFind.mockResolvedValue([gateway]);
    
      const sensor = new SensorDAO();
      
      sensor.macAddress = "11:22:33:44:55:66";
      mockSensorFind.mockResolvedValue([sensor]);
    
      const measurements = [
        { value: 25.5, createdAt: new Date(), sensor }
      ];
      mockMeasurementFind.mockResolvedValue(measurements);
    
      const startDate = new Date("2024-01-01");
    
      const result = await repo.getMeasurementsByNetwork(
        "NET001",
        undefined,
        startDate
      );
    
      expect(mockMeasurementFind).toHaveBeenCalledWith({
        where: {
          sensor: { id: expect.any(Object) },
          createdAt: expect.objectContaining({
            _type: "moreThanOrEqual",
            _value: startDate
          })
        },
        order: { createdAt: "ASC" },
        relations: { sensor: true }
      });

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        sensorMac: "11:22:33:44:55:66",
        measurements: expect.arrayContaining([
          expect.objectContaining({ value: 25.5 })
        ])
      });
    });
    
    it("should get measurements by network with only end date", async () => {
      const network = new NetworkDAO();
      network.code = "NET001";
      
      mockNetworkFind.mockResolvedValue([network]);
    
      const gateway = new GatewayDAO();
      
      gateway.macAddress = "AA:BB:CC:DD:EE:FF";
      mockGatewayFind.mockResolvedValue([gateway]);
    
      const sensor = new SensorDAO();
      
      sensor.macAddress = "11:22:33:44:55:66";
      mockSensorFind.mockResolvedValue([sensor]);
    
      const measurements = [
        { value: 25.5, createdAt: new Date(), sensor }
      ];
      mockMeasurementFind.mockResolvedValue(measurements);
    
      const endDate = new Date("2024-01-31");
    
      const result = await repo.getMeasurementsByNetwork(
        "NET001",
        undefined,
        undefined,
        endDate
      );
    
      expect(mockMeasurementFind).toHaveBeenCalledWith({
        where: {
          sensor: { id: expect.any(Object) },
          createdAt: expect.objectContaining({
            _type: "lessThanOrEqual",
            _value: endDate
          })
        },
        order: { createdAt: "ASC" },
        relations: { sensor: true }
      });

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        sensorMac: "11:22:33:44:55:66",
        measurements: expect.arrayContaining([
          expect.objectContaining({ value: 25.5 })
        ])
      });
    });
    
    it("should return empty array when no sensors found", async () => {
      const network = new NetworkDAO();
      network.code = "NET001";
      
      mockNetworkFind.mockResolvedValue([network]);
    
      const gateway = new GatewayDAO();
      
      gateway.macAddress = "AA:BB:CC:DD:EE:FF";
      mockGatewayFind.mockResolvedValue([gateway]);
    
      mockSensorFind.mockResolvedValue([]);
    
      const result = await repo.getMeasurementsByNetwork("NET001");
    
      expect(result).toEqual([]);
    });
    
    it("should handle specific sensor MACs with some non-existing ones", async () => {
      const network = new NetworkDAO();
      network.code = "NET001";
      
      mockNetworkFind.mockResolvedValue([network]);
    
      const gateway = new GatewayDAO();
      
      gateway.macAddress = "AA:BB:CC:DD:EE:FF";
      mockGatewayFind.mockResolvedValue([gateway]);
    
      const sensor = new SensorDAO();
      
      sensor.macAddress = "11:22:33:44:55:66";
      mockSensorFind.mockResolvedValue([sensor]);
    
      const measurements = [
        { value: 25.5, createdAt: new Date(), sensor }
      ];
      mockMeasurementFind.mockResolvedValue(measurements);
    
      const result = await repo.getMeasurementsByNetwork(
        "NET001",
        ["11:22:33:44:55:66", "NON:EX:IS:TE:NT:01", "NON:EX:IS:TE:NT:02"]
      );
    
      expect(result).toHaveLength(1);
      expect(result[0].sensorMac).toBe("11:22:33:44:55:66");
    });
    
    it("should handle duplicate sensor MACs in request", async () => {
      const network = new NetworkDAO();
      network.code = "NET001";
      
      mockNetworkFind.mockResolvedValue([network]);
    
      const gateway = new GatewayDAO();
      
      gateway.macAddress = "AA:BB:CC:DD:EE:FF";
      mockGatewayFind.mockResolvedValue([gateway]);
    
      const sensor = new SensorDAO();
      
      sensor.macAddress = "11:22:33:44:55:66";
      mockSensorFind.mockResolvedValue([sensor]);
    
      const measurements = [
        { value: 25.5, createdAt: new Date(), sensor }
      ];
      mockMeasurementFind.mockResolvedValue(measurements);
    
      const result = await repo.getMeasurementsByNetwork(
        "NET001",
        ["11:22:33:44:55:66", "11:22:33:44:55:66", "11:22:33:44:55:66"]
      );
    
      expect(result).toHaveLength(1);
      expect(result[0].sensorMac).toBe("11:22:33:44:55:66");
    });
  });
});
