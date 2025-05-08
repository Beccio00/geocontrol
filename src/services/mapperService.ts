import { Token as TokenDTO } from "@dto/Token";
import { User as UserDTO } from "@dto/User";
import { UserDAO } from "@models/dao/UserDAO";
import { ErrorDTO } from "@models/dto/ErrorDTO";
import { UserType } from "@models/UserType";
import { Sensor as SensorDTO } from "@models/dto/Sensor";
import { SensorDAO } from "@models/dao/SensorDAO";

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
