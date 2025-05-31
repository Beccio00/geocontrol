import { Sensor as SensorDTO } from "@dto/Sensor";
import { SensorRepository } from "@repositories/SensorRepository";
import { mapSensorDAOToDTO } from "@services/mapperService";

export async function getAllSensor(networkCode: string, gatewayMac: string): Promise<SensorDTO[]> {
  const sensorRepo = new SensorRepository();
  return (await sensorRepo.getAllSensor(networkCode, gatewayMac)).map(mapSensorDAOToDTO);
}
export async function createSensor(networkCode: string, gatewayMac: string, sensorDTO: SensorDTO): Promise<void> {
  const userRepo = new SensorRepository();
  await userRepo.createSensor(
    networkCode,
    gatewayMac, 
    sensorDTO.macAddress,
    sensorDTO.name, 
    sensorDTO.description,
    sensorDTO.variable,
    sensorDTO.unit 
  );
}
export async function getSensorByMac(networkCode: string, gatewayMac: string, sensorMac: string): Promise<SensorDTO> {
  const sensorRepo = new SensorRepository();
  return mapSensorDAOToDTO(await sensorRepo.getSensorByMac(networkCode, gatewayMac, sensorMac));
}

export async function updateSensor(networkCode: string, gatewayMac: string, sensorMac: string, sensorDTO : SensorDTO):Promise<void> {
  const userRepo = new SensorRepository();
  await userRepo.updateSensor(
    networkCode,
    gatewayMac,
    sensorMac, 
    sensorDTO?.macAddress, 
    sensorDTO?.name, 
    sensorDTO?.description,
    sensorDTO?.variable,
    sensorDTO?.unit
  );
}

export async function deleteSensorByMac(networkCode: string, gatewayMac: string, sensorMac: string): Promise<void> {
  const userRepo = new SensorRepository();
  await userRepo.deleteSensorByMac(networkCode,gatewayMac,sensorMac);
}