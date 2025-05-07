import { Token as TokenDTO } from "@dto/Token";
import { User as UserDTO } from "@dto/User";
import { Network as NetworkDTO } from "@dto/Network";
import { NetworkDAO } from "@models/dao/NetworkDAO";
import { UserDAO } from "@models/dao/UserDAO";
import { ErrorDTO } from "@models/dto/ErrorDTO";
import { UserType } from "@models/UserType";
import { create } from "domain";
import { Gateway as GatewayDTO } from "@models/dto/Gateway";
import { GatewayDAO } from "@models/dao/GatewayDAO";
import { Sensor as SensorDTO } from "@models/dao/SensorDAO";

export function createErrorDTO(
  code: number,
  message?: string,
  name?: string
): ErrorDTO {
  return removeNullAttributes({
    code,
    name,
    message
  }) as ErrorDTO;
}

export function createTokenDTO(token: string): TokenDTO {
  return removeNullAttributes({
    token: token
  }) as TokenDTO;
}

export function createUserDTO(
  username: string,
  type: UserType,
  password?: string
): UserDTO {
  return removeNullAttributes({
    username,
    type,
    password
  }) as UserDTO;
}

export function mapUserDAOToDTO(userDAO: UserDAO): UserDTO {
  return createUserDTO(userDAO.username, userDAO.type);
}

function removeNullAttributes<T>(dto: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(dto).filter(
      ([_, value]) =>
        value !== null &&
        value !== undefined &&
        (!Array.isArray(value) || value.length > 0)
    )
  ) as Partial<T>;
}

export function createNetworkDTO(
  code?: string,
  name?: string,
  description?: string,
  gateways?: Array<GatewayDTO>
): NetworkDTO {
  return removeNullAttributes({
    code,
    name,
    description,
    gateways
  }) as NetworkDTO;
} 

export function mapNetworkDAOToDTO(networkDAO: NetworkDAO): NetworkDTO {
  return createNetworkDTO( 
     networkDAO.code,
     networkDAO.name, 
     networkDAO.description, 
     networkDAO.gateways?.map((g: GatewayDAO) => g.mapGatewayDAOToDTO(g)) ); 
}


export function createGatewayDTO(
  macAddress?: string,
  name?: string,
  description?: string,
  sensors?: Array<SensorDTO>
): GatewayDTO {
  return removeNullAttributes({
    macAddress,
    name,
    description,
    sensors
  }) as GatewayDTO;
}

export function mapGatewayDAOToDTO(gatewayDAO: GatewayDAO): GatewayDTO {
  return createGatewayDTO(
    gatewayDAO.macAddress,
    gatewayDAO.name,
    gatewayDAO.description,
    gatewayDAO.sensors?.map((s) => s.mapSensorDAOToDTO(s))
  );
}
