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

  const createNetwork = (code: string = "NET001"): NetworkDAO => {
    const network = new NetworkDAO();
    network.code = code;
    return network;
  };

  const createGateway = (macAddress: string = "AA:BB:CC:DD:EE:FF"): GatewayDAO => {
    const gateway = new GatewayDAO();
    gateway.macAddress = macAddress;
    return gateway;
  };

  const createSensor = (macAddress: string = "11:22:33:44:55:66"): SensorDAO => {
    const sensor = new SensorDAO();
    sensor.macAddress = macAddress;
    return sensor;
  };

  const createMeasurement = (value: number, sensor: SensorDAO, createdAt?: Date): MeasurementDAO => {
    const measurement = new MeasurementDAO();
    measurement.value = value;
    measurement.createdAt = createdAt || new Date();
    measurement.sensor = sensor;
    return measurement;
  };

  const setupBasicEntities = () => {
    const network = createNetwork();
    const gateway = createGateway();
    const sensor = createSensor();

    mockNetworkFind.mockResolvedValue([network]);
    mockGatewayFind.mockResolvedValue([gateway]);
    mockSensorFind.mockResolvedValue([sensor]);

    return { network, gateway, sensor };
  };

  const expectDateFilter = (type: string, value: Date | Date[]) => {
    return expect.objectContaining({
      _type: type,
      _value: value
    });
  };

  describe("storeMeasurement", () => {
    it("should store measurement successfully", async () => {
      const { sensor } = setupBasicEntities();
      const savedMeasurement = createMeasurement(25.5, sensor);
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
      const network = createNetwork();
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
      const network = createNetwork();
      const gateway = createGateway();
      mockNetworkFind.mockResolvedValue([network]);
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
    const testGetMeasurementsBySensor = async (
      startDate?: Date,
      endDate?: Date,
      expectedCreatedAtFilter?: any
    ) => {
      const { sensor } = setupBasicEntities();
      const measurements = [
        createMeasurement(25.5, sensor),
        createMeasurement(26.0, sensor)
      ];
      mockMeasurementFind.mockResolvedValue(measurements);

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
          createdAt: expectedCreatedAtFilter
        },
        order: { createdAt: "ASC" }
      });

      return { result, measurements };
    };

    it("should get measurements by sensor with date range", async () => {
      const startDate = new Date("2024-01-01");
      const endDate = new Date("2024-01-31");
      
      const { result, measurements } = await testGetMeasurementsBySensor(
        startDate,
        endDate,
        expectDateFilter("between", [startDate, endDate])
      );

      expect(result).toEqual(measurements);
    });

    it("should get measurements without date range", async () => {
      const { result } = await testGetMeasurementsBySensor(
        undefined,
        undefined,
        undefined
      );
      
      expect(result).toHaveLength(2);
    });
    
    it("should get measurements with only start date", async () => {
      const startDate = new Date("2024-01-01");
      
      const { result, measurements } = await testGetMeasurementsBySensor(
        startDate,
        undefined,
        expectDateFilter("moreThanOrEqual", startDate)
      );

      expect(result).toEqual(measurements);
    });
    
    it("should get measurements with only end date", async () => {
      const endDate = new Date("2024-01-31");
      
      const { result, measurements } = await testGetMeasurementsBySensor(
        undefined,
        endDate,
        expectDateFilter("lessThanOrEqual", endDate)
      );

      expect(result).toEqual(measurements);
    });
  });

  describe("getMeasurementsByNetwork", () => {
    const setupNetworkTest = (sensors: SensorDAO[] = [createSensor()]) => {
      const network = createNetwork();
      const gateway = createGateway();
      
      mockNetworkFind.mockResolvedValue([network]);
      mockGatewayFind.mockResolvedValue([gateway]);
      mockSensorFind.mockResolvedValue(sensors);

      return { network, gateway, sensors };
    };

    const testGetMeasurementsByNetwork = async (
      networkCode: string = "NET001",
      sensorMacs?: string[],
      startDate?: Date,
      endDate?: Date,
      expectedCreatedAtFilter?: any
    ) => {
      const { sensors } = setupNetworkTest();
      const measurements = sensors.map(sensor => createMeasurement(25.5, sensor));
      mockMeasurementFind.mockResolvedValue(measurements);

      const result = await repo.getMeasurementsByNetwork(
        networkCode,
        sensorMacs,
        startDate,
        endDate
      );

      if (expectedCreatedAtFilter !== undefined) {
        expect(mockMeasurementFind).toHaveBeenCalledWith({
          where: {
            sensor: { id: expect.any(Object) },
            createdAt: expectedCreatedAtFilter
          },
          order: { createdAt: "ASC" },
          relations: { sensor: true }
        });
      }

      return { result, measurements };
    };

    it("should get measurements by network without dates and macs", async () => {
      const { result } = await testGetMeasurementsByNetwork();
      
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        sensorMac: "11:22:33:44:55:66",
        measurements: expect.arrayContaining([
          expect.objectContaining({ value: 25.5 })
        ])
      });
    });

    it("should return empty array when no gateways found", async () => {
      const network = createNetwork();
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
      const sensor1 = createSensor("11:22:33:44:55:66");
      const sensor2 = createSensor("77:88:99:AA:BB:CC");
      setupNetworkTest([sensor1, sensor2]);
      
      const measurements = [
        createMeasurement(25.5, sensor1),
        createMeasurement(26.0, sensor2)
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
      const startDate = new Date("2024-01-01");
      const endDate = new Date("2024-01-31");

      const { result } = await testGetMeasurementsByNetwork(
        "NET001",
        undefined,
        startDate,
        endDate,
        expectDateFilter("between", [startDate, endDate])
      );
      
      expect(result).toHaveLength(1);
    });
    
    it("should get measurements by network with only start date", async () => {
      const startDate = new Date("2024-01-01");
      
      const { result } = await testGetMeasurementsByNetwork(
        "NET001",
        undefined,
        startDate,
        undefined,
        expectDateFilter("moreThanOrEqual", startDate)
      );
      
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        sensorMac: "11:22:33:44:55:66",
        measurements: expect.arrayContaining([
          expect.objectContaining({ value: 25.5 })
        ])
      });
    });
    
    it("should get measurements by network with only end date", async () => {
      const endDate = new Date("2024-01-31");
      
      const { result } = await testGetMeasurementsByNetwork(
        "NET001",
        undefined,
        undefined,
        endDate,
        expectDateFilter("lessThanOrEqual", endDate)
      );

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        sensorMac: "11:22:33:44:55:66",
        measurements: expect.arrayContaining([
          expect.objectContaining({ value: 25.5 })
        ])
      });
    });
    
    it("should return empty array when no sensors found", async () => {
      setupNetworkTest([]);
      const result = await repo.getMeasurementsByNetwork("NET001");
      expect(result).toEqual([]);
    });
    
    it("should handle specific sensor MACs with some non-existing ones", async () => {
      const sensor = createSensor("11:22:33:44:55:66");
      setupNetworkTest([sensor]);
      
      const measurements = [createMeasurement(25.5, sensor)];
      mockMeasurementFind.mockResolvedValue(measurements);

      const result = await repo.getMeasurementsByNetwork(
        "NET001",
        ["11:22:33:44:55:66", "NON:EX:IS:TE:NT:01", "NON:EX:IS:TE:NT:02"]
      );

      expect(result).toHaveLength(1);
      expect(result[0].sensorMac).toBe("11:22:33:44:55:66");
    });
    
    it("should handle duplicate sensor MACs in request", async () => {
      const sensor = createSensor("11:22:33:44:55:66");
      setupNetworkTest([sensor]);
      
      const measurements = [createMeasurement(25.5, sensor)];
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