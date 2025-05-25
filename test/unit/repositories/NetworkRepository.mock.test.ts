import { NetworkRepository } from "@repositories/NetworkRepository";
import { NetworkDAO } from "@dao/NetworkDAO";
import { UnauthorizedError } from "@models/errors/UnauthorizedError";
import { NotFoundError } from "@models/errors/NotFoundError";
import { InsufficientRightsError } from "@models/errors/InsufficientRightsError";
import { GatewayDAO } from "@models/dao/GatewayDAO";
import { Gateway } from "@models/dto/Gateway";
import { ConflictError } from "@models/errors/ConflictError";

const mockFind = jest.fn();
const mockSave = jest.fn();
const mockRemove = jest.fn();

jest.mock("@database", () => ({
  AppDataSource: {
    getRepository: () => ({
      find: mockFind,
      save: mockSave,
      remove: mockRemove
    })
  }
}));

describe("NetworkRepository: mocked database", () => {
  const repo = new NetworkRepository();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("get all networks", async () => {
    const networks = [new NetworkDAO(), new NetworkDAO()];
    networks[0].code = "1";
    networks[0].name = "Network 1";
    networks[0].description = "Description 1";
    networks[0].gateways = [];

    networks[1].code = "2";
    networks[1].name = "Network 2";
    networks[1].description = "Description 2";
    networks[1].gateways = [];

    mockFind.mockResolvedValue(networks);

    const result = await repo.getAllNetworks();

    expect(result).toEqual(networks);
    expect(mockFind).toHaveBeenCalledWith();
  });

  it("get all networks: no networks", async () => {
    mockFind.mockResolvedValue([]); 
    const result = await repo.getAllNetworks();
    expect(result).toEqual([]);
    expect(mockFind).toHaveBeenCalledWith();
  });

  it("get network by Code", async () => {
    const network = new NetworkDAO();
    network.code = "1";
    network.name = "Network 1";
    network.description = "Description 1";
    network.gateways = [];
    mockFind.mockResolvedValue([network]);

    const result = await repo.getNetworkByCode("1");

    expect(result).toEqual(network);
    expect(result.code).toBe("1");
    expect(mockFind).toHaveBeenCalledWith({ where: { code: "1" } });
  });

  it("get network by Code: not found", async () => {
    mockFind.mockResolvedValue([]);

    await expect(repo.getNetworkByCode("1")).rejects.toThrow(NotFoundError);
    expect(mockFind).toHaveBeenCalledWith({ where: { code: "1" } });
  });

  it("create network", async () => {
    const newNetwork = new NetworkDAO();
    newNetwork.code = "1";
    newNetwork.name = "Network 1";
    newNetwork.description = "Description 1";
    newNetwork.gateways = [];
    mockFind.mockResolvedValue([]); // No existing networks with this code
    mockSave.mockResolvedValue(newNetwork);

    const result = await repo.createNetwork(newNetwork.code, newNetwork.name, newNetwork.description, newNetwork.gateways);

    expect(result).toEqual(newNetwork);
    expect(mockFind).toHaveBeenCalledWith({ where: { code: "1" } });
    expect(mockSave).toHaveBeenCalledWith({
      code: newNetwork.code,
      name: newNetwork.name,
      description: newNetwork.description,
      gateways: newNetwork.gateways});
    });

  it ("create network: conflict", async () => {
    const existingNetwork = new NetworkDAO();
    existingNetwork.code = "1";
    existingNetwork.name = "Network 1";
    existingNetwork.description = "Description 1";

    mockFind.mockResolvedValue([existingNetwork]);
    await expect(repo.createNetwork("1", "Network 1", "Description 1", [])).rejects.toThrow(ConflictError);
    expect(mockFind).toHaveBeenCalledWith({ where: { code: "1" } });
  });

  it("create network: with gateways", async () => {
    const gateways: Gateway[] = [
      { macAddress: "AA:BB:CC:DD:EE:F1", name: "Gateway 1", description: "Test Gateway 1", sensors: []
      } as Gateway,
      { macAddress: "AA:BB:CC:DD:EE:F2",  name: "Gateway 2", description: "Test Gateway 2", sensors: []
      } as Gateway
    ];
    
    mockFind.mockResolvedValue([]);
    mockSave.mockResolvedValue({ code: "NET1", name: "Test", description: "Desc", gateways });

    const result = await repo.createNetwork("NET1", "Test", "Desc", gateways);

    expect(mockSave).toHaveBeenCalledWith({
      code: "NET1",
      name: "Test",
      description: "Desc",
      gateways: gateways
    });
  });

  it("delete network", async () => {
    const network = new NetworkDAO();
    network.code = "1";
    mockFind.mockResolvedValue([network]);
    mockRemove.mockResolvedValue(undefined);
    
    await repo.deleteNetwork("1");

    expect(mockFind).toHaveBeenCalledWith({ where: { code: "1" } });
    expect(mockRemove).toHaveBeenCalledWith(network);
  });

  it("delete network: not found", async () => {
    mockFind.mockResolvedValue([]);

    await expect(repo.deleteNetwork("nonexistent")).rejects.toThrow(NotFoundError);
    expect(mockFind).toHaveBeenCalledWith({ where: { code: "nonexistent" } });
    expect(mockRemove).not.toHaveBeenCalled();
  });

  it("update network - update with new code", async () => {
    const existingNetwork = new NetworkDAO();
    existingNetwork.code = "123"; existingNetwork.name = "Old Name";
    existingNetwork.description = "Old Description"; existingNetwork.gateways = [];

    const updatedNetwork = new NetworkDAO();
    updatedNetwork.code = "456"; updatedNetwork.name = "New Name";
    updatedNetwork.description = "New Description"; updatedNetwork.gateways = [];

    // mock finding the existing network
    mockFind.mockResolvedValueOnce([existingNetwork]);
    // mock checking new code doesn't exist
    mockFind.mockResolvedValueOnce([]);
    // Mock save the updated network
    mockSave.mockResolvedValue(updatedNetwork);

    const result = await repo.updateNetwork("123", "456", "New Name", "New Description");

    expect(result).toEqual(updatedNetwork);
    expect(mockFind).toHaveBeenCalledTimes(2);
    expect(mockFind).toHaveBeenNthCalledWith(1, { where: { code: "123" } });
    expect(mockFind).toHaveBeenNthCalledWith(2, { where: { code: "456" } });
    expect(mockSave).toHaveBeenCalledWith(expect.objectContaining({
      code: "456", name: "New Name", description: "New Description" }));
  });

  it("update network - update without changing code", async () => {
    const existingNetwork = new NetworkDAO();
    existingNetwork.code = "SAME_CODE"; existingNetwork.name = "Old Name";
    existingNetwork.description = "Old Description"; existingNetwork.gateways = [];

    const updatedNetwork = new NetworkDAO();
    updatedNetwork.code = "SAME_CODE"; updatedNetwork.name = "New Name";
    updatedNetwork.description = "New Description"; updatedNetwork.gateways = [];

    mockFind.mockResolvedValue([existingNetwork]);
    mockSave.mockResolvedValue(updatedNetwork);

    const result = await repo.updateNetwork("SAME_CODE", "SAME_CODE", "New Name", "New Description");

    expect(result).toEqual(updatedNetwork);
    expect(mockFind).toHaveBeenCalledTimes(1); // Only called once since code didn't change
    expect(mockFind).toHaveBeenCalledWith({ where: { code: "SAME_CODE" } });
    expect(mockSave).toHaveBeenCalledWith(expect.objectContaining({
      code: "SAME_CODE", name: "New Name", description: "New Description" }));
  });

  it("update network - partial update with null/undefined values", async () => {
    const existingNetwork = new NetworkDAO();
    existingNetwork.code = "TEST_CODE"; 
    existingNetwork.name = "Original Name";
    existingNetwork.description = "Original Description"; 
    existingNetwork.gateways = [];

    mockFind.mockResolvedValue([existingNetwork]);
    mockSave.mockResolvedValue(existingNetwork);

    const result = await repo.updateNetwork("TEST_CODE", null, null, "New Description");

    expect(mockSave).toHaveBeenCalledWith(expect.objectContaining({
      code: "TEST_CODE",
      name: "Original Name", 
      description: "New Description" 
    }));
  });

  it("update network - update with empty string values", async () => {
    const existingNetwork = new NetworkDAO();
    existingNetwork.code = "TEST_CODE"; existingNetwork.name = "Original Name";
    existingNetwork.description = "Original Description"; existingNetwork.gateways = [];

    mockFind.mockResolvedValue([existingNetwork]);
    mockSave.mockResolvedValue(existingNetwork);

    const result = await repo.updateNetwork("TEST_CODE", "", "", "");

    expect(mockSave).toHaveBeenCalledWith(expect.objectContaining({
      code: "TEST_CODE", // Should keep original code (empty string is falsy)
      name: "Original Name", // Should keep original name (empty string is falsy)
      description: "Original Description" // Should keep original description (empty string is falsy)
    }));
  });

  it("update network - network not found", async () => {
    mockFind.mockResolvedValue([]);

    await expect(repo.updateNetwork("NONEXISTENT", "NEW_CODE", "New Name", "New Description"))
      .rejects.toThrow(NotFoundError);
    
    expect(mockFind).toHaveBeenCalledWith({ where: { code: "NONEXISTENT" } });
    expect(mockSave).not.toHaveBeenCalled();
  });

  it("update network - conflict, new code already exists", async () => {
    const existingNetwork = new NetworkDAO();
    existingNetwork.code = "OLD_CODE"; 
    existingNetwork.name = "Old Name";
    existingNetwork.description = "Old Description";

    const conflictingNetwork = new NetworkDAO();
    conflictingNetwork.code = "EXISTING_CODE";
    conflictingNetwork.name = "Conflicting Network";

    mockFind.mockResolvedValueOnce([existingNetwork]);
    mockFind.mockResolvedValueOnce([conflictingNetwork]);

    // attempting to update the existing network with a code that already exists
    // the second find checks in a network with the new code already exist, throwis a conflict if found
    await expect(repo.updateNetwork("OLD_CODE", "EXISTING_CODE", "New Name", "New Description"))
      .rejects.toThrow(ConflictError);
    
    expect(mockFind).toHaveBeenCalledTimes(2);
    expect(mockFind).toHaveBeenNthCalledWith(1, { where: { code: "OLD_CODE" } });
    expect(mockFind).toHaveBeenNthCalledWith(2, { where: { code: "EXISTING_CODE" } });
    expect(mockSave).not.toHaveBeenCalled();
  });

});