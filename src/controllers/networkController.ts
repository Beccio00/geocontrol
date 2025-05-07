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