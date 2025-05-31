import { SensorRepository } from "@repositories/SensorRepository";
import { GatewayRepository } from "@repositories/GatewayRepository";
import { NetworkRepository } from "@repositories/NetworkRepository";
import { SensorDAO } from "@dao/SensorDAO";
import { GatewayDAO } from "@dao/GatewayDAO";
import { NetworkDAO } from "@dao/NetworkDAO";
import { initializeTestDataSource, closeTestDataSource, TestDataSource } from "@test/setup/test-datasource";
import { NotFoundError } from "@models/errors/NotFoundError";
import { ConflictError } from "@models/errors/ConflictError";

describe("SensorRepository: SQLite in-memory", () => {
  beforeAll(async () => {
    await initializeTestDataSource();
  });

  const sensorRepo = new SensorRepository();
  const gatewayRepo = new GatewayRepository();
  const networkRepo = new NetworkRepository();
  const networkCode = "test-network";
  const gatewayMac = "00:11:22:33:44:55";
  const sensorMac = "71:B1:CE:01:C6:A9";

  beforeEach(async () => {
    await TestDataSource.getRepository(SensorDAO).clear();
    await TestDataSource.getRepository(GatewayDAO).clear();
    await TestDataSource.getRepository(NetworkDAO).clear();

    // Create a network and gateway for testing
    await networkRepo.createNetwork(networkCode, "Test Network", "A test network", []);
    await gatewayRepo.createGateway(networkCode, gatewayMac, "Test Gateway", "A test gateway", []);
  });

  afterAll(async () => {
    await closeTestDataSource();
  });

  // Create sensor
  it("create sensor", async () => {
    const sensor = await sensorRepo.createSensor(networkCode,gatewayMac,sensorMac,"Test Sensor","A test sensor","temperature","C");

    expect(sensor).toMatchObject({
      macAddress: sensorMac,
      name: "Test Sensor",
      description: "A test sensor",
      variable: "temperature",
      unit: "C",
    });

    const found = await sensorRepo.getSensorByMac(networkCode, gatewayMac, sensorMac);
    expect(found.macAddress).toBe(sensorMac);
  });

  it("NotFoundError if the network does not exist", async () => {
    await expect(
      sensorRepo.createSensor("invalid-network", gatewayMac, sensorMac, "Test Sensor", "Description", "temperature", "C")
    ).rejects.toThrow(NotFoundError);
  });

  it("NotFoundError if the gateway does not exist", async () => {
    await expect(
      sensorRepo.createSensor(networkCode, "invalid-gateway", sensorMac, "Test Sensor", "Description", "temperature", "C")
    ).rejects.toThrow(NotFoundError);
  });

  it("ConflictError if the sensor already exists", async () => {
    await sensorRepo.createSensor(networkCode, gatewayMac, sensorMac, "Test Sensor", "A test sensor", "temperature", "C");
    await expect(
      sensorRepo.createSensor(networkCode, gatewayMac, sensorMac, "Another Sensor", "Another description", "humidity", "C")
    ).rejects.toThrow(ConflictError);
  });

  // Get all sensors
  it("get all sensors", async () => {
    await sensorRepo.createSensor(networkCode, gatewayMac, sensorMac, "Test Sensor 1", "Description 1", "temperature", "C");
    await sensorRepo.createSensor(networkCode, gatewayMac, "66:77:88:99:AA:BB", "Test Sensor 2", "Description 2", "humidity", "%");

    const sensors = await sensorRepo.getAllSensor(networkCode, gatewayMac);
    expect(sensors.length).toBe(2);
    expect(sensors.map((s) => s.macAddress)).toEqual(expect.arrayContaining([sensorMac, "66:77:88:99:AA:BB"]));
  });

  it("empty array if no sensors are found for a valid gateway", async () => {
    const sensors = await sensorRepo.getAllSensor(networkCode, gatewayMac);
    expect(sensors).toEqual([]);
  });

  it("NotFoundError if network does not exist in getAllSensor", async () => {
    await expect(sensorRepo.getAllSensor("non-existent-network", gatewayMac)).rejects.toThrow(NotFoundError);
  });

  it("NotFoundError if gateway does not exist in getAllSensor", async () => {
    await expect(sensorRepo.getAllSensor(networkCode, "non-existent-gateway")).rejects.toThrow(NotFoundError);
  });

  // Get sensor by MAC
  it("get sensor by MAC", async () => {
    await sensorRepo.createSensor(networkCode, gatewayMac, sensorMac, "Test Sensor", "A test sensor", "temperature", "C");

    const sensor = await sensorRepo.getSensorByMac(networkCode, gatewayMac, sensorMac);
    expect(sensor).toMatchObject({
      macAddress: sensorMac,
      name: "Test Sensor",
      description: "A test sensor",
    });
  });

  it("NotFoundError if MAC does not exist", async () => {
    await expect(sensorRepo.getSensorByMac(networkCode, gatewayMac, "non-existent-mac")).rejects.toThrow(NotFoundError);
  });

  it("NotFoundError if sensorMac exists but is associated with a different gateway", async () => {
    await sensorRepo.createSensor(networkCode, gatewayMac, sensorMac, "Test Sensor", "A test sensor", "temperature", "C");
    await expect(sensorRepo.getSensorByMac(networkCode, "different-gateway", sensorMac)).rejects.toThrow(NotFoundError);
  });

  // Update sensor
  it("update sensor", async () => {
    await sensorRepo.createSensor(networkCode, gatewayMac, sensorMac, "Test Sensor", "A test sensor", "temperature", "C");

    const updatedSensor = await sensorRepo.updateSensor( networkCode,gatewayMac,sensorMac, "AA:BB:CC:DD:EE:FF", "Updated Sensor", "Updated description", "humidity", "%");

    expect(updatedSensor).toMatchObject({
      macAddress: "AA:BB:CC:DD:EE:FF",
      name: "Updated Sensor",
      description: "Updated description",
      variable: "humidity",
      unit: "%",
    });

    const found = await sensorRepo.getSensorByMac(networkCode, gatewayMac, "AA:BB:CC:DD:EE:FF");
    expect(found.name).toBe("Updated Sensor");
  });

  it("update sensor with partial fields", async () => {
    await sensorRepo.createSensor(networkCode, gatewayMac, sensorMac, "Test Sensor", "A test sensor", "temperature", "C");

    const updatedSensor = await sensorRepo.updateSensor(  networkCode,gatewayMac,sensorMac, null, null,"Updated description",null,"%" );

    expect(updatedSensor).toMatchObject({
      macAddress: sensorMac,
      name: "Test Sensor",
      description: "Updated description",
      variable: "temperature",
      unit: "%",
    });

    const found = await sensorRepo.getSensorByMac(networkCode, gatewayMac, sensorMac);
    expect(found.description).toBe("Updated description");
  });

  it("NotFoundError if network does not exist when updating a sensor", async () => {
    await expect(
      sensorRepo.updateSensor("invalid-network", gatewayMac, sensorMac, "new-mac", "Updated Sensor", "Updated description", "humidity", "%")
    ).rejects.toThrow(NotFoundError);
  });

  it("NotFoundError if gateway does not exist when updating a sensor", async () => {
    await expect(
      sensorRepo.updateSensor(networkCode, "non-existent-gateway", sensorMac, "new-mac", "Updated Sensor", "Updated description", "humidity", "%")
    ).rejects.toThrow(NotFoundError);
  });

  it("NotFoundError if sensor does not exist when updating", async () => {
    await expect(
      sensorRepo.updateSensor(networkCode, gatewayMac, "non-existent-mac", "new-mac", "Updated Sensor", "Updated description", "humidity", "%")
    ).rejects.toThrow(NotFoundError);
  });

  it("ConflictError if new MAC address already exists when updating", async () => {
    await sensorRepo.createSensor(networkCode, gatewayMac, "existing-mac", "Existing Sensor", "Description", "temperature", "C");
    await sensorRepo.createSensor(networkCode, gatewayMac, sensorMac, "Test Sensor", "A test sensor", "temperature", "C");

    await expect(
      sensorRepo.updateSensor(networkCode, gatewayMac, sensorMac, "existing-mac", "Updated Sensor", "Updated description", "humidity", "%")
    ).rejects.toThrow(ConflictError);
  });

  it("should retain all fields if no new fields are provided in updateSensor", async () => {
    await sensorRepo.createSensor(networkCode, gatewayMac, sensorMac, "Test Sensor", "A test sensor", "temperature", "C");

    const updatedSensor = await sensorRepo.updateSensor(networkCode, gatewayMac, sensorMac, null, null, null, null, null);

    expect(updatedSensor).toMatchObject({
      macAddress: sensorMac,
      name: "Test Sensor",
      description: "A test sensor",
      variable: "temperature",
      unit: "C",
    });
  });

  // Delete sensor
  it("delete sensor", async () => {
    await sensorRepo.createSensor(networkCode, gatewayMac, sensorMac, "Test Sensor", "A test sensor", "temperature", "C");

    await sensorRepo.deleteSensorByMac(networkCode, gatewayMac, sensorMac);

    await expect(sensorRepo.getSensorByMac(networkCode, gatewayMac, sensorMac)).rejects.toThrow(NotFoundError);
  });

  it("NotFoundError error deleting a non-existent sensor", async () => {
    await expect(sensorRepo.deleteSensorByMac(networkCode, gatewayMac, "non-existent-mac")).rejects.toThrow(NotFoundError);
  });

  it("NotFoundError if sensorMac exists but is associated with a different gateway", async () => {
        await sensorRepo.createSensor(networkCode, gatewayMac, sensorMac, "Test Sensor", "A test sensor", "temperature", "C");
        await expect(sensorRepo.deleteSensorByMac(networkCode, "different-gateway", sensorMac)).rejects.toThrow(NotFoundError);
    });
});