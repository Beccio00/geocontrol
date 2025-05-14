import { Token as TokenDTO } from "@dto/Token";
import { User as UserDTO } from "@dto/User";
import { Network as NetworkDTO } from "@dto/Network";
import { NetworkDAO } from "@models/dao/NetworkDAO";
import { UserDAO } from "@models/dao/UserDAO";
import { ErrorDTO } from "@models/dto/ErrorDTO";
import { UserType } from "@models/UserType";
import { Sensor as SensorDTO } from "@models/dto/Sensor";
import { SensorDAO } from "@models/dao/SensorDAO";
import { create } from "domain";
import { Gateway as GatewayDTO } from "@models/dto/Gateway";
import { GatewayDAO } from "@models/dao/GatewayDAO";
import { Measurement as MeasurementDTO } from "@dto/Measurement";
import { Measurements as MeasurementsDTO } from "@dto/Measurements";
import { MeasurementDAO } from "@dao/MeasurementDAO";
import { Stats } from "@dto/Stats";


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
        (!Array.isArray(value) || value.length >= 0)  //FIXME: set value.length > 0
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
     networkDAO.gateways 
    ); 
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
    gatewayDAO.sensors?.map(mapSensorDAOToDTO)
  );
}

export function createSensorDTO(
  macAddress? : string,
  name?: string,
  description?: string,
  variable?: string,
  unit?: string,
): SensorDTO {
  return removeNullAttributes({
    macAddress,
    name,
    description,
    variable,
    unit
  }) as SensorDTO;
}

export function mapSensorDAOToDTO(SensorDAO: SensorDAO): SensorDTO {
  return createSensorDTO(SensorDAO.macAddress, SensorDAO.name, SensorDAO.description, SensorDAO.variable, SensorDAO.unit);
}

export function createMeasurementDTO(
  createdAt?: Date,
  value?: number,
  isOutlier?: boolean
): MeasurementDTO {
  return removeNullAttributes({
    createdAt,
    value,
    isOutlier
  }) as MeasurementDTO;
}

export function mapMeasurementDAOToDTO(
  dao: MeasurementDAO,
  stats?: Stats
): MeasurementDTO {
  // Calculate isOutlier dynamically if stats are provided
  const isOutlier =
    stats &&
    (dao.value > stats.upperThreshold || dao.value < stats.lowerThreshold);

  // Use createMeasurementDTO to construct the DTO
  return createMeasurementDTO(dao.createdAt, dao.value, isOutlier);
}

export function createMeasurementsDTO(
  sensorMacAddress?: string,
  measurements?: MeasurementDTO[],
  stats?: Stats
): MeasurementsDTO {
  return removeNullAttributes({
    sensorMacAddress,
    measurements,
    stats,
  }) as MeasurementsDTO;
}

export function mapMeasurementsToDTO(
  sensorMacAddress: string,
  measurementDAOs: MeasurementDAO[],
  stats?: Stats
): MeasurementsDTO {
  return createMeasurementsDTO(
    sensorMacAddress,
    measurementDAOs,
    stats
  );
}

export function createStatsDTO(
  mean?: number,
  variance?: number,
  upperThreshold?: number,
  lowerThreshold?: number
): Stats {
  return removeNullAttributes({
    mean,
    variance,
    upperThreshold,
    lowerThreshold,
  }) as Stats;
}

export function mapStatsToDTO(stats: {
  mean: number;
  variance: number;
  upperThreshold: number;
  lowerThreshold: number;
}): Stats {
  return createStatsDTO(
    stats.mean,
    stats.variance,
    stats.upperThreshold,
    stats.lowerThreshold
  );
}