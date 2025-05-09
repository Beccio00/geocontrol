import { Network as NetworkDTO } from "@dto/Network";
import { NetworkDAO } from "@models/dao/NetworkDAO";
import { mapNetworkDAOToDTO } from "@services/mapperService";
import { NetworkRepostory } from "@repositories/NetworkRepository";

export async function getAllNetworks(): Promise<NetworkDTO[]> {
  const networkRepo = new NetworkRepostory();
  return (await networkRepo.getAllNetworks()).map(mapNetworkDAOToDTO);
}

export async function createNetwork(networkDto: NetworkDTO): Promise<void> {
    const networkRepo = new NetworkRepostory();
    await networkRepo.createNetwork(networkDto.code, networkDto.name, networkDto.description, networkDto.gateways);   
}

export async function getNetwork(code: string): Promise<NetworkDTO> {
  const networkRepo = new NetworkRepostory();
  return mapNetworkDAOToDTO(await networkRepo.getNetworkByCode(code));
}

export async function updateNetwork(code: string, networkDto: NetworkDTO): Promise<void> {
  const networkRepo = new NetworkRepostory();
  await networkRepo.updateNetwork(code, networkDto?.code, networkDto?.name, networkDto?.description);
}

export async function deleteNetwork(code: string): Promise<void> {
  const networkRepo = new NetworkRepostory();
  await networkRepo.deleteNetwork(code);
}