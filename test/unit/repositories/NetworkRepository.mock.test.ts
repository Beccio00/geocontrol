import { NetworkRepository } from "@repositories/NetworkRepository";
import { NetworkDAO } from "@dao/NetworkDAO";
import { UnauthorizedError } from "@models/errors/UnauthorizedError";
import { NotFoundError } from "@models/errors/NotFoundError";
import { InsufficientRightsError } from "@models/errors/InsufficientRightsError";

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
    expect(mockFind).toHaveBeenCalledWith({ where: { code: "nonexistent" } });
  });

  it("create network", async () => {
    const newNetwork = new NetworkDAO();
    newNetwork.id = "2";
    mockSave.mockResolvedValue(newNetwork);

    const result = await repo.createNetwork(newNetwork);

    expect(result).toBeInstanceOf(NetworkDAO);
    expect(result.id).toBe("2");
    expect(mockSave).toHaveBeenCalledWith(newNetwork);
  });

  it("delete network", async () => {
    const network = new NetworkDAO();
    network.id = "3";
    mockFind.mockResolvedValue([network]);
    
    await repo.deleteNetwork("3");

    expect(mockRemove).toHaveBeenCalledWith(network);
  });

  it("delete network: not found", async () => {
    mockFind.mockResolvedValue([]);

    await expect(repo.deleteNetwork("4")).rejects.toThrow(NotFoundError);
  });

  it("unauthorized access", async () => {
    await expect(repo.unauthorizedAccess()).rejects.toThrow(UnauthorizedError);
  });

  it("insufficient rights", async () => {
    await expect(repo.insufficientRights()).rejects.toThrow(InsufficientRightsError);
  });
});