import * as gatewayController from "@controllers/gatewayController";
import { GatewayRepository } from "@repositories/GatewayRepository";
import { NetworkRepository } from "@repositories/NetworkRepository";
import { GatewayDAO } from "@dao/GatewayDAO";
import { NetworkDAO } from "@dao/NetworkDAO";
import { initializeTestDataSource, closeTestDataSource, TestDataSource } from "@test/setup/test-datasource";
import { Gateway as GatewayDTO } from "@dto/Gateway";
import { NotFoundError } from "@models/errors/NotFoundError";

describe("GatewayController integration", () => {
  const gatewayRepo = new GatewayRepository();
  const networkRepo = new NetworkRepository();
  const networkCode = "test-network";
  const gatewayMac = "00:11:22:33:44:55";

  beforeAll(async () => {
    await initializeTestDataSource();
  });

  afterAll(async () => {
    await closeTestDataSource();
  });

  beforeEach(async () => {
    await TestDataSource.getRepository(GatewayDAO).clear();
    await TestDataSource.getRepository(NetworkDAO).clear();

    // Create a network for testing
    await networkRepo.createNetwork(networkCode, "Test Network", "A test network", []);
  });

//createGateway

  it("createGateway: should create a new gateway", async () => {
    const gatewayDto: GatewayDTO = {
      macAddress: gatewayMac,
      name: "Test Gateway",
      description: "A test gateway",
      sensors: [],
    };

    await gatewayController.createGateway(networkCode, gatewayDto);

    const gateway = await gatewayRepo.getGateway(networkCode, gatewayMac);
    expect(gateway).toMatchObject({
      macAddress: gatewayMac,
      name: "Test Gateway",
      description: "A test gateway",
    });
  });

  // getAllGateways
  it("getAllGateways: should return all gateways in a network", async () => {
    await gatewayRepo.createGateway(networkCode, gatewayMac, "Gateway 1", "Description 1", []);
    await gatewayRepo.createGateway(networkCode, "66:77:88:99:AA:BB", "Gateway 2", "Description 2", []);

    const result = await gatewayController.getAllGateways(networkCode);

    expect(result.length).toBe(2);
    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ macAddress: gatewayMac, name: "Gateway 1", description: "Description 1" }),
        expect.objectContaining({ macAddress: "66:77:88:99:AA:BB", name: "Gateway 2", description: "Description 2" }),
      ])
    );
  });

// getGateway
  it("getGateway: should return a specific gateway", async () => {
    await gatewayRepo.createGateway(networkCode, gatewayMac, "Test Gateway", "A test gateway", []);

    const result = await gatewayController.getGateway(networkCode, gatewayMac);

    expect(result).toMatchObject({
      macAddress: gatewayMac,
      name: "Test Gateway",
      description: "A test gateway",
    });
  });


  
  it("getGateway: should throw NotFoundError if gateway does not exist", async () => {
    await expect(gatewayController.getGateway(networkCode, "non-existent-mac")).rejects.toThrow(NotFoundError);
  });
  
//updateGateway

  it("updateGateway: should update a gateway", async () => {
    // Arrange
    await gatewayRepo.createGateway(networkCode, gatewayMac, "Test Gateway", "A test gateway", []);
    const updatedGatewayDto: GatewayDTO = {
      macAddress: "AA:BB:CC:DD:EE:FF",
      name: "Updated Gateway",
      description: "Updated description",
      sensors: [],
    };

    await gatewayController.updateGateway(networkCode, gatewayMac, updatedGatewayDto);

    const updatedGateway = await gatewayRepo.getGateway(networkCode, "AA:BB:CC:DD:EE:FF");
    expect(updatedGateway).toMatchObject({
      macAddress: "AA:BB:CC:DD:EE:FF",
      name: "Updated Gateway",
      description: "Updated description",
    });
  });

//deleteGateway

  it("deleteGateway: should delete a gateway", async () => {
    await gatewayRepo.createGateway(networkCode, gatewayMac, "Test Gateway", "A test gateway", []);

    await gatewayController.deleteGateway(networkCode, gatewayMac);

    await expect(gatewayRepo.getGateway(networkCode, gatewayMac)).rejects.toThrow(NotFoundError);
  });

});