import * as sensorController from "@controllers/sensorController";
import { SensorRepository } from "@repositories/SensorRepository";
import { GatewayRepository } from "@repositories/GatewayRepository";
import { NetworkRepository } from "@repositories/NetworkRepository";
import { SensorDAO } from "@dao/SensorDAO";
import { GatewayDAO } from "@dao/GatewayDAO";
import { NetworkDAO } from "@dao/NetworkDAO";
import { initializeTestDataSource, closeTestDataSource, TestDataSource } from "@test/setup/test-datasource";
import { Sensor as SensorDTO } from "@dto/Sensor";
import { NotFoundError } from "@models/errors/NotFoundError";
import { ConflictError } from "@models/errors/ConflictError";

describe("SensorController integration", () => {
  const sensorRepo = new SensorRepository();
  const gatewayRepo = new GatewayRepository();
  const networkRepo = new NetworkRepository();
  const networkCode = "test-network";
  const gatewayMac = "00:11:22:33:44:55";
  const sensorMac = "71:B1:CE:01:C6:A9";

  beforeAll(async () => {
    await initializeTestDataSource();
  });

  afterAll(async () => {
    await closeTestDataSource();
  });

  beforeEach(async () => {
    await TestDataSource.getRepository(SensorDAO).clear();
    await TestDataSource.getRepository(GatewayDAO).clear();
    await TestDataSource.getRepository(NetworkDAO).clear();

    // Create a network and gateway for testing
    await networkRepo.createNetwork(networkCode, "Test Network", "A test network", []);
    await gatewayRepo.createGateway(networkCode, gatewayMac, "Test Gateway", "A test gateway", []);
  });

  // createSensor
  it("createSensor: should create a new sensor", async () => {
    const sensorDto: SensorDTO = {
      macAddress: sensorMac,
      name: "Test Sensor",
      description: "A test sensor",
      variable: "temperature",
      unit: "C",
    };

    await sensorController.createSensor(networkCode, gatewayMac, sensorDto);

    const sensor = await sensorRepo.getSensorByMac(networkCode, gatewayMac, sensorMac);
    expect(sensor).toMatchObject({
      macAddress: sensorMac,
      name: "Test Sensor",
      description: "A test sensor",
      variable: "temperature",
      unit: "C",
    });
  });

  it("ConflictError if sensor already exists", async () => {
    const sensorDto: SensorDTO = {
      macAddress: sensorMac,
      name: "Test Sensor",
      description: "A test sensor",
      variable: "temperature",
      unit: "C",
    };

    await sensorController.createSensor(networkCode, gatewayMac, sensorDto);

    await expect(sensorController.createSensor(networkCode, gatewayMac, sensorDto)).rejects.toThrow(ConflictError);
  });

  // getAllSensor
  it("getAllSensor: should return all sensors in a gateway", async () => {
    await sensorRepo.createSensor(networkCode, gatewayMac, sensorMac, "Sensor 1", "Description 1", "temperature", "C");
    await sensorRepo.createSensor(networkCode, gatewayMac, "66:77:88:99:AA:BB", "Sensor 2", "Description 2", "humidity", "%");

    const sensors = await sensorController.getAllSensor(networkCode, gatewayMac);

    expect(sensors.length).toBe(2);
    expect(sensors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ macAddress: sensorMac, name: "Sensor 1", description: "Description 1" }),
        expect.objectContaining({ macAddress: "66:77:88:99:AA:BB", name: "Sensor 2", description: "Description 2" }),
      ])
    );
  });

  it("getAllSensor: should return an empty array if no sensors exist", async () => {
    const sensors = await sensorController.getAllSensor(networkCode, gatewayMac);
    expect(sensors).toEqual([]);
  });

  // getSensorByMac
  it("getSensorByMac: should return a specific sensor", async () => {
    await sensorRepo.createSensor(networkCode, gatewayMac, sensorMac, "Test Sensor", "A test sensor", "temperature", "C");

    const sensor = await sensorController.getSensorByMac(networkCode, gatewayMac, sensorMac);

    expect(sensor).toMatchObject({
      macAddress: sensorMac,
      name: "Test Sensor",
      description: "A test sensor",
      variable: "temperature",
      unit: "C",
    });
  });

  it("NotFoundError if sensor does not exist", async () => {
    await expect(sensorController.getSensorByMac(networkCode, gatewayMac, "non-existent-mac")).rejects.toThrow(NotFoundError);
  });

  // updateSensor
  it("updateSensor: should update a sensor", async () => {
    await sensorRepo.createSensor(networkCode, gatewayMac, sensorMac, "Test Sensor", "A test sensor", "temperature", "C");

    const updatedSensorDto: SensorDTO = {
      macAddress: "AA:BB:CC:DD:EE:FF",
      name: "Updated Sensor",
      description: "Updated description",
      variable: "humidity",
      unit: "%",
    };

    await sensorController.updateSensor(networkCode, gatewayMac, sensorMac, updatedSensorDto);

    const updatedSensor = await sensorRepo.getSensorByMac(networkCode, gatewayMac, "AA:BB:CC:DD:EE:FF");
    expect(updatedSensor).toMatchObject({
      macAddress: "AA:BB:CC:DD:EE:FF",
      name: "Updated Sensor",
      description: "Updated description",
      variable: "humidity",
      unit: "%",
    });
  });

  it("NotFoundError if sensor does not exist", async () => {
    const updatedSensorDto: SensorDTO = {
      macAddress: "AA:BB:CC:DD:EE:FF",
      name: "Updated Sensor",
      description: "Updated description",
      variable: "humidity",
      unit: "%",
    };

    await expect(sensorController.updateSensor(networkCode, gatewayMac, "non-existent-mac", updatedSensorDto)).rejects.toThrow(NotFoundError);
  });

  // deleteSensorByMac
  it("deleteSensorByMac: should delete a sensor", async () => {
    await sensorRepo.createSensor(networkCode, gatewayMac, sensorMac, "Test Sensor", "A test sensor", "temperature", "C");

    await sensorController.deleteSensorByMac(networkCode, gatewayMac, sensorMac);

    await expect(sensorRepo.getSensorByMac(networkCode, gatewayMac, sensorMac)).rejects.toThrow(NotFoundError);
  });

  it("NotFoundError if sensor does not exist", async () => {
    await expect(sensorController.deleteSensorByMac(networkCode, gatewayMac, "non-existent-mac")).rejects.toThrow(NotFoundError);
  });
});