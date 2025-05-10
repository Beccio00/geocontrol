import { Gateway as GatewayDTO } from "@dto/Gateway";
import { GatewayDAO } from "@models/dao/GatewayDAO";
import { mapGatewayDAOToDTO } from "@services/mapperService";
import { GatewayRepository } from "@repositories/GatewayRepository";

export async function getAllGateways(networkCode: string): Promise<GatewayDTO[]> {
    const gatewayRepo = new GatewayRepository();
    return (await gatewayRepo.getAllGateways(networkCode)).map(mapGatewayDAOToDTO);
  }

export async function createGateway(networkCode: string, gatewayDto: GatewayDTO): Promise<void> {
    const gatewayRepo = new GatewayRepository();
    await gatewayRepo.createGateway(networkCode, gatewayDto.macAddress, gatewayDto.name, gatewayDto.description, gatewayDto.sensors);
 }

export async function getGateway(networkCode: string, macAddress: string): Promise<GatewayDTO> {
    const gatewayRepo = new GatewayRepository();
    const gateway = await gatewayRepo.getGateway(networkCode, macAddress);
    return mapGatewayDAOToDTO(gateway);
  }

export async function updateGateway(networkCode: string, oldMac: string, updatedData: Partial<GatewayDTO>): Promise<void> {
    const gatewayRepo = new GatewayRepository();
    await gatewayRepo.updateGateway(networkCode, oldMac, updatedData);
  }

export async function deleteGateway(networkCode: string, macAddress: string): Promise<void> {
    const gatewayRepo = new GatewayRepository();
    await gatewayRepo.deleteGateway(networkCode, macAddress);
  }

  