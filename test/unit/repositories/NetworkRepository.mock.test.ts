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
/*
  it("unauthorized access", async () => {
    await expect(repo.unauthorizedAccess()).rejects.toThrow(UnauthorizedError);
  });

  it("insufficient rights", async () => {
    await expect(repo.insufficientRights()).rejects.toThrow(InsufficientRightsError);
  });*/
});