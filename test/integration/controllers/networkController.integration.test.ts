import * as networkController from "@controllers/networkController";
import { NetworkRepository } from "@repositories/NetworkRepository";
import { GatewayRepository } from "@repositories/GatewayRepository";
import { NetworkDAO } from "@dao/NetworkDAO";
import { GatewayDAO } from "@dao/GatewayDAO";
import { initializeTestDataSource, closeTestDataSource, TestDataSource } from "@test/setup/test-datasource";
import { Network as NetworkDTO } from "@dto/Network";
import { Gateway as GatewayDTO } from "@dto/Gateway";
import { NotFoundError } from "@models/errors/NotFoundError";
import { ConflictError } from "@models/errors/ConflictError";

describe("NetworkController integration", () => {
    const networkRepo = new NetworkRepository();
    const gatewayRepo = new GatewayRepository();
    const networkCode = "test-network";

    beforeAll(async () => {
        await initializeTestDataSource();
    });

    afterAll(async () => {
        await closeTestDataSource();
    });

    beforeEach(async () => {
        await TestDataSource.getRepository(NetworkDAO).clear();
        await TestDataSource.getRepository(GatewayDAO).clear();
    });

    it("createNetwork: should create a new network", async () => {
        const networkDto: NetworkDTO = {
        code: networkCode,
        name: "Test Network",
        description: "A test network",
        gateways: [],
        };

        await networkController.createNetwork(networkDto);

        const network = await networkRepo.getNetworkByCode(networkCode);
        expect(network).toMatchObject({
        code: networkCode,
        name: "Test Network",
        description: "A test network",
        });
    });

    it("createNetwork: should create a network with gateways", async () => {
        const networkDto: NetworkDTO = {
        code: networkCode,
        name: "Test Network",
        description: "A test network",
        gateways: [
            {
            macAddress: "AA:BB:CC:DD:EE:FF",
            name: "Gateway 1",
            description: "First gateway",
            sensors: []
            },
            {
            macAddress: "11:22:33:44:55:66",
            name: "Gateway 2", 
            description: "Second gateway",
            sensors: []
            }
        ],};

        await networkController.createNetwork(networkDto);

        const network = await networkRepo.getNetworkByCode(networkCode);
        expect(network).toMatchObject({
            code: networkCode,
            name: "Test Network",
            description: "A test network",
        });
        expect(network.gateways).toHaveLength(2);
    });

    it("createNetwork: should handle duplicate network codes", async () => {
        const networkDto: NetworkDTO = {
        code: networkCode,
        name: "Test Network",
        description: "A test network",
        gateways: [],
        };

        await networkController.createNetwork(networkDto);
        
        await expect(networkController.createNetwork(networkDto)).rejects.toThrow(ConflictError);
    });

    /*
    it("createNetwork: should handle null networkDto", async () => {
        await expect(networkController.createNetwork(null)).rejects.toThrow();
    });*/

    it("getAllNetworks: should return all networks", async () => {
        await networkRepo.createNetwork("NET1", "Network 1", "Description 1", []);
        await networkRepo.createNetwork("NET2", "Network 2", "Description 2", []);

        const result = await networkController.getAllNetworks();

        expect(result.length).toBe(2);
        expect(result).toEqual(
        expect.arrayContaining([
            expect.objectContaining({ code: "NET1", name: "Network 1", description: "Description 1" }),
            expect.objectContaining({ code: "NET2", name: "Network 2", description: "Description 2" }),
        ])
        );
    });

    it("getAllNetworks: should return empty array when no networks exist", async () => {
        const result = await networkController.getAllNetworks();

        expect(result).toEqual([]);
        expect(result).toHaveLength(0);
    });

    it("getNetwork: should return a specific network", async () => {
        await networkRepo.createNetwork(networkCode, "Test Network", "A test network", []);

        const result = await networkController.getNetwork(networkCode);

        expect(result).toMatchObject({
        code: networkCode,
        name: "Test Network",
        description: "A test network",
        });
    });

    it("getNetwork: should return network with gateways", async () => {
        await networkRepo.createNetwork(networkCode, "Test Network", "A test network", []);
        await gatewayRepo.createGateway(networkCode, "AA:BB:CC:DD:EE:FF", "Gateway 1", "Description 1", []);
        await gatewayRepo.createGateway(networkCode, "11:22:33:44:55:66", "Gateway 2", "Description 2", []);

        const result = await networkController.getNetwork(networkCode);

        expect(result).toMatchObject({
        code: networkCode,
        name: "Test Network", 
        description: "A test network",
        });
        expect(result.gateways).toHaveLength(2);
        expect(result.gateways).toEqual(
        expect.arrayContaining([
            expect.objectContaining({ macAddress: "AA:BB:CC:DD:EE:FF", name: "Gateway 1" }),
            expect.objectContaining({ macAddress: "11:22:33:44:55:66", name: "Gateway 2" }),
        ])
        );
    });

    it("getNetwork: should throw NotFoundError if network does not exist", async () => {
        await expect(networkController.getNetwork("non-eistent-code")).rejects.toThrow(NotFoundError);
    });
    
    it("updateNetwork: should update a network", async () => {
        await networkRepo.createNetwork(networkCode, "Test Network", "A test network", []);
        
        const updatedNetworkDto: NetworkDTO = {
        code: "updated-network",
        name: "Updated Network",
        description: "Updated description",
        gateways: [],
        };

        await networkController.updateNetwork(networkCode, updatedNetworkDto);

        const updatedNetwork = await networkRepo.getNetworkByCode("updated-network");
        expect(updatedNetwork).toMatchObject({
        code: "updated-network",
        name: "Updated Network",
        description: "Updated description",
        });
    });

    it("updateNetwork: should handle partial updates", async () => {
        await networkRepo.createNetwork(networkCode, "Test Network", "A test network", []);
        
        const partialUpdateDto: NetworkDTO = {
        code: networkCode,
        name: "Updated Name Only",
        description: undefined,
        gateways: [],
        };

        await networkController.updateNetwork(networkCode, partialUpdateDto);

        const updatedNetwork = await networkRepo.getNetworkByCode(networkCode);
        expect(updatedNetwork).toMatchObject({
        code: networkCode,
        name: "Updated Name Only",
        description: "A test network",
        });
    });

    it("updateNetwork: should handle null networkDto", async () => {
        await networkRepo.createNetwork(networkCode, "Test Network", "A test network", []);

        await networkController.updateNetwork(networkCode, null);

        // network should still exist (no changes made)
        const network = await networkRepo.getNetworkByCode(networkCode);
        expect(network).toMatchObject({
        code: networkCode,
        name: "Test Network",
        description: "A test network",
        });
    });

    it("updateNetwork: should throw NotFoundError if network does not exist", async () => {
        const networkDto: NetworkDTO = {
        code: "new-code",
        name: "New Name",
        description: "New Description",
        gateways: [],
        };

        await expect(networkController.updateNetwork("non-existent-code", networkDto)).rejects.toThrow(NotFoundError);
    });

    it("deleteNetwork: should delete a network", async () => {
        await networkRepo.createNetwork(networkCode, "Test Network", "A test network", []);

        await networkController.deleteNetwork(networkCode);

        await expect(networkRepo.getNetworkByCode(networkCode)).rejects.toThrow(NotFoundError);
    });
    /*
    it("deleteNetwork: should delete network and its gateways", async () => {
        await networkRepo.createNetwork(networkCode, "Test Network", "A test network", []);
        await gatewayRepo.createGateway(networkCode, "AA:BB:CC:DD:EE:FF", "Gateway 1", "Description 1", []);

        await networkController.deleteNetwork(networkCode);

        await expect(networkRepo.getNetworkByCode(networkCode)).rejects.toThrow(NotFoundError);
        await expect(gatewayRepo.getGateway(networkCode, "AA:BB:CC:DD:EE:FF")).rejects.toThrow(NotFoundError);
    });*/

    it("deleteNetwork: should throw NotFoundError if network does not exist", async () => {
        await expect(networkController.deleteNetwork("non-existent-code")).rejects.toThrow(NotFoundError);
    });

    /*
    it("getAllNetworks: should handle networks with complex gateway structures", async () => {
        await networkRepo.createNetwork("NET1", "Network 1", "Description 1", []);
        await networkRepo.createNetwork("NET2", "Network 2", "Description 2", []);
        
        // Add gateways to networks
        await gatewayRepo.createGateway("NET1", "AA:BB:CC:DD:EE:FF", "Gateway 1", "Description 1", []);
        await gatewayRepo.createGateway("NET2", "11:22:33:44:55:66", "Gateway 2", "Description 2", []);

        const result = await networkController.getAllNetworks();

        expect(result).toHaveLength(2);
        const net1 = result.find(n => n.code === "NET1");
        const net2 = result.find(n => n.code === "NET2");
        
        expect(net1.gateways).toHaveLength(1);
        expect(net2.gateways).toHaveLength(1);
    });*/
});