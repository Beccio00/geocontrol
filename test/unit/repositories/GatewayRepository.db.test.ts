import { GatewayRepository } from "@repositories/GatewayRepository";
import { NetworkRepository } from "@repositories/NetworkRepository";
import { GatewayDAO } from "@dao/GatewayDAO";
import { NetworkDAO } from "@dao/NetworkDAO";
import { initializeTestDataSource, closeTestDataSource, TestDataSource } from "@test/setup/test-datasource";
import { NotFoundError } from "@models/errors/NotFoundError";
import { ConflictError } from "@models/errors/ConflictError";


describe("GatewayRepository: SQLite in-memory", () => {

    beforeAll(async () => {
        await initializeTestDataSource();
    });    

        const gatewayRepo = new GatewayRepository();
        const networkRepo = new NetworkRepository();
        const networkCode = "test-network";
        const gatewayMac = "00:11:22:33:44:55";

    beforeEach(async () => {
        await TestDataSource.getRepository(GatewayDAO).clear();
        await TestDataSource.getRepository(NetworkDAO).clear();

        // Create a network for testing
        await networkRepo.createNetwork(networkCode, "Test Network", "A test network", []);
    });
    afterAll(async () => {
        await closeTestDataSource();
    });

//create gateway

    it("create gateway", async () => {
        const gateway = await gatewayRepo.createGateway(networkCode,gatewayMac,"Test Gateway","A test gateway",[]);
        expect(gateway).toMatchObject({
            macAddress: gatewayMac,
            name: "Test Gateway",
            description: "A test gateway",
        });

        const found = await gatewayRepo.getGateway(networkCode, gatewayMac);
        expect(found.macAddress).toBe(gatewayMac);
    });

    it("error create gateway if the network does not exist", async () => {
        await expect(gatewayRepo.createGateway("invalid-network", gatewayMac, "Test Gateway", "Description", [])).rejects.toThrow(NotFoundError);
    });

    it("create gateway: conflict", async () => {
        await gatewayRepo.createGateway(networkCode, gatewayMac, "Test Gateway", "A test gateway", []);
        await expect(gatewayRepo.createGateway(networkCode, gatewayMac, "Another Gateway", "Another description", [])).rejects.toThrow(ConflictError);
    });

        it("ConflictError if new MAC address already exists", async () => {
        await gatewayRepo.createGateway(networkCode, "existing-mac", "Existing Gateway", "Description", []);
        await gatewayRepo.createGateway(networkCode, gatewayMac, "Test Gateway", "A test gateway", []);

        await expect(
            gatewayRepo.updateGateway(networkCode, gatewayMac, "existing-mac", "Updated Gateway", "Updated description")
        ).rejects.toThrow(ConflictError);
    });

    it("should create a gateway when no conflict exists", async () => {
        const gateway = await gatewayRepo.createGateway(networkCode,gatewayMac,"Test Gateway","A test gateway",  []);

        expect(gateway).toMatchObject({
            macAddress: gatewayMac,
            name: "Test Gateway",
            description: "A test gateway",
        });
    });

    it("should retain the old description if newDescription is null", async () => {
        // Create a gateway to update
        await gatewayRepo.createGateway(networkCode, gatewayMac, "Test Gateway", "A test gateway", []);

        // Update the gateway with null for newDescription
        const updatedGateway = await gatewayRepo.updateGateway(  networkCode,gatewayMac, null,  "Updated Gateway",  null );

        // Verify the updated fields
        expect(updatedGateway).toMatchObject({
            macAddress: gatewayMac, // MAC address remains unchanged
            name: "Updated Gateway", // Name is updated
            description: "A test gateway", // Description remains unchanged
        });

        // Retrieve the updated gateway and verify the changes
        const found = await gatewayRepo.getGateway(networkCode, gatewayMac);
        expect(found.name).toBe("Updated Gateway");
        expect(found.description).toBe("A test gateway"); // Explicitly verify description remains unchanged
    });
// get all gateway

    it("get all gateways", async () => {
        await gatewayRepo.createGateway(networkCode, gatewayMac, "Test Gateway 1", "Description 1", []);
        await gatewayRepo.createGateway(networkCode, "66:77:88:99:AA:BB", "Test Gateway 2", "Description 2", []);

        const gateways = await gatewayRepo.getAllGateways(networkCode);
        expect(gateways.length).toBe(2);
        expect(gateways.map((g) => g.macAddress)).toEqual(expect.arrayContaining([gatewayMac, "66:77:88:99:AA:BB"]));
    });

    it("NotFoundError if network does not exist in getAllGateways", async () => {
        const networkCode = "non-existent-network";
        await expect(gatewayRepo.getAllGateways(networkCode)).rejects.toThrow(NotFoundError );
    });

// get gateway by mac

    it("get gateway: not found", async () => {
        await expect(gatewayRepo.getGateway(networkCode, "non-existent-mac")).rejects.toThrow(NotFoundError);
    });

//update gateway

    it("update gateway", async () => {
        await gatewayRepo.createGateway(networkCode, gatewayMac, "Test Gateway", "A test gateway", []);

        const updatedGateway = await gatewayRepo.updateGateway(networkCode,gatewayMac, "AA:BB:CC:DD:EE:FF","Updated Gateway","Updated description");

        expect(updatedGateway).toMatchObject({
            macAddress: "AA:BB:CC:DD:EE:FF",
            name: "Updated Gateway",
            description: "Updated description",
        });

        const found = await gatewayRepo.getGateway(networkCode, "AA:BB:CC:DD:EE:FF");
        expect(found.name).toBe("Updated Gateway");
    });

    it("update a gateway with partial fields", async () => {
        // Create a gateway to update
        await gatewayRepo.createGateway(networkCode, gatewayMac, "Test Gateway", "A test gateway", []);

        // Update the gateway with only a new name, leaving other fields unchanged
        const updatedGateway = await gatewayRepo.updateGateway( networkCode, gatewayMac, null,   null, "Updated description" );

        // Verify the updated fields
        expect(updatedGateway).toMatchObject({
            macAddress: gatewayMac, // MAC address remains unchanged
            name: "Test Gateway", // Name remains unchanged
            description: "Updated description", // Description is updated
        });

        // Retrieve the updated gateway and verify the changes
        const found = await gatewayRepo.getGateway(networkCode, gatewayMac);
        expect(found.name).toBe("Test Gateway"); // Explicitly verify name remains unchanged
        expect(found.description).toBe("Updated description");
    });

    it("update all fields of a gateway", async () => {
        // Create a gateway to update
        await gatewayRepo.createGateway(networkCode, gatewayMac, "Test Gateway", "A test gateway", []);

        // Update all fields
        const updatedGateway = await gatewayRepo.updateGateway(networkCode, gatewayMac, "AA:BB:CC:DD:EE:FF", "Updated Gateway", "Updated description" );

        // Verify the updated fields
        expect(updatedGateway).toMatchObject({
            macAddress: "AA:BB:CC:DD:EE:FF",
            name: "Updated Gateway",
            description: "Updated description",
        });

        // Retrieve the updated gateway and verify the changes
        const found = await gatewayRepo.getGateway(networkCode, "AA:BB:CC:DD:EE:FF");
        expect(found.name).toBe("Updated Gateway");
        expect(found.description).toBe("Updated description");
    });


    it(" NotFoundError if network does not exist when updating a gateway", async () => {
        await expect(
            gatewayRepo.updateGateway("invalid-network", gatewayMac, "new-mac", "Updated Gateway", "Updated description")
        ).rejects.toThrow(NotFoundError);
    });

    it(" NotFoundError if gateway does not exist when updating", async () => {
        await expect(
            gatewayRepo.updateGateway(networkCode, "non-existent-mac", "new-mac", "Updated Gateway", "Updated description")
        ).rejects.toThrow(NotFoundError);
    });


// delete gateway

    it("delete gateway", async () => {
        await gatewayRepo.createGateway(networkCode, gatewayMac, "Test Gateway", "A test gateway", []);

        await gatewayRepo.deleteGateway(networkCode, gatewayMac);

        await expect(gatewayRepo.getGateway(networkCode, gatewayMac)).rejects.toThrow(NotFoundError);
    });

    it("error deleting a non-existent gateway", async () => {
        await expect(gatewayRepo.deleteGateway(networkCode, "non-existent-mac")).rejects.toThrow(NotFoundError);
    });


});