import { MeasurementRepository } from "@repositories/MeasurementRepository";
import {
  initializeTestDataSource,
  closeTestDataSource,
  TestDataSource
} from "@test/setup/test-datasource";
import { MeasurementDAO } from "@models/dao/MeasurementDAO";
import { NetworkDAO } from "@models/dao/NetworkDAO";
import { GatewayDAO } from "@models/dao/GatewayDAO";
import { SensorDAO } from "@dao/SensorDAO";
import { NotFoundError } from "@models/errors/NotFoundError";

// Test con database SQLite in-memory
beforeAll(async () => {
  await initializeTestDataSource();
});

afterAll(async () => {
  await closeTestDataSource();
});

beforeEach(async () => {
  await TestDataSource.getRepository(MeasurementDAO).clear();
  await TestDataSource.getRepository(SensorDAO).clear();
  await TestDataSource.getRepository(GatewayDAO).clear();
  await TestDataSource.getRepository(NetworkDAO).clear();
});

describe("MeasurementRepository: SQLite in-memory", () => {
  const repo = new MeasurementRepository();

  it("should store and retrieve measurement", async () => {
    // Setup test data
    const network = await TestDataSource.getRepository(NetworkDAO).save({
      code: "NET001",
      name: "Test Network"
    });

    const gateway = await TestDataSource.getRepository(GatewayDAO).save({
      macAddress: "AA:BB:CC:DD:EE:FF",
      name: "Test Gateway",
      network
    });

    const sensor = await TestDataSource.getRepository(SensorDAO).save({
      macAddress: "11:22:33:44:55:66",
      name: "Test Sensor",
      gateway
    });

    // Store measurement
    const measurement = await repo.storeMeasurement(
      "NET001",
      "AA:BB:CC:DD:EE:FF",
      "11:22:33:44:55:66",
      25.5,
      new Date()
    );

    expect(measurement).toMatchObject({
      value: 25.5,
      sensor: expect.objectContaining({
        macAddress: "11:22:33:44:55:66"
      })
    });

    // Retrieve measurements
    const measurements = await repo.getMeasurementsBySensor(
      "NET001",
      "AA:BB:CC:DD:EE:FF",
      "11:22:33:44:55:66"
    );

    expect(measurements).toHaveLength(1);
    expect(measurements[0].value).toBe(25.5);
  });

  it("should get measurements by network", async () => {
    // Setup test data
    const network = await TestDataSource.getRepository(NetworkDAO).save({
      code: "NET001",
      name: "Test Network"
    });

    const gateway = await TestDataSource.getRepository(GatewayDAO).save({
      macAddress: "AA:BB:CC:DD:EE:FF",
      name: "Test Gateway",
      network
    });

    const sensor = await TestDataSource.getRepository(SensorDAO).save({
      macAddress: "11:22:33:44:55:66",
      name: "Test Sensor",
      gateway
    });

    // Store some measurements
    await repo.storeMeasurement(
      "NET001",
      "AA:BB:CC:DD:EE:FF",
      "11:22:33:44:55:66",
      25.5,
      new Date()
    );

    await repo.storeMeasurement(
      "NET001",
      "AA:BB:CC:DD:EE:FF",
      "11:22:33:44:55:66",
      26.0,
      new Date()
    );

    // Get measurements by network
    const result = await repo.getMeasurementsByNetwork("NET001");

    expect(result).toHaveLength(1);
    expect(result[0].sensorMac).toBe("11:22:33:44:55:66");
    expect(result[0].measurements).toHaveLength(2);
  });

  it("should handle date filtering", async () => {
    // Setup test data
    const network = await TestDataSource.getRepository(NetworkDAO).save({
      code: "NET001",
      name: "Test Network"
    });

    const gateway = await TestDataSource.getRepository(GatewayDAO).save({
      macAddress: "AA:BB:CC:DD:EE:FF",
      name: "Test Gateway",
      network
    });

    const sensor = await TestDataSource.getRepository(SensorDAO).save({
      macAddress: "11:22:33:44:55:66",
      name: "Test Sensor",
      gateway
    });

    const oldDate = new Date("2023-01-01");
    const newDate = new Date("2024-01-01");

    // Store measurements with different dates
    await repo.storeMeasurement(
      "NET001",
      "AA:BB:CC:DD:EE:FF",
      "11:22:33:44:55:66",
      25.5,
      oldDate
    );

    await repo.storeMeasurement(
      "NET001",
      "AA:BB:CC:DD:EE:FF",
      "11:22:33:44:55:66",
      26.0,
      newDate
    );

    // Filter by start date
    const filtered = await repo.getMeasurementsBySensor(
      "NET001",
      "AA:BB:CC:DD:EE:FF",
      "11:22:33:44:55:66",
      new Date("2023-12-01")
    );

    expect(filtered).toHaveLength(1);
    expect(filtered[0].value).toBe(26.0);
  });

  it("should throw NotFoundError for invalid network", async () => {
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
});