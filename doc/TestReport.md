# Test Report

<The goal of this document is to explain how the application was tested, detailing how the test cases were defined and what they cover>

# Contents

- [Test Report](#test-report)
- [Contents](#contents)
- [Dependency graph](#dependency-graph)
- [Integration approach](#integration-approach)
- [Tests](#tests)
- [Coverage](#coverage)
  - [Coverage of FR](#coverage-of-fr)
  - [Coverage white box](#coverage-white-box)

# Dependency graph

![Grafico delle dipendenze](./images/dependencyGraph.png)


# Integration approach

  L'approccio utilizzato è bottom up guardando in maniera indipendente la logica per i sensori, gateway, network, misure,autenticazione e utenti. 
  
  Quindi per ogniuno di essi abbiamo seguito il seguente approccio: 

  step 1: unit test del repository
  step 2: integration test repository e controller
  step 3: e2e test

    <Write here the integration sequence you adopted, in general terms (top down, bottom up, mixed) and as sequence

    (ex: step1: unit A, step 2: unit A+B, step 3: unit A+B+C, etc)>

    <Some steps may  correspond to unit testing (ex step1 in ex above)>

    <One step will  correspond to API testing, or testing unit route.js>

# Tests

<in the table below list the test cases defined For each test report the object tested, the test level (API, integration, unit) and the technique used to define the test case (BB/ eq partitioning, BB/ boundary, WB/ statement coverage, etc)> <split the table if needed>

| Test case name                                      | Object(s) tested                  | Test level     | Technique used          |
| :------------------------------------------------: | :-------------------------------: | :------------: | :---------------------: |
| **Unit Tests (GatewayRepository.db.test.ts)**      |                                   |                |                         |
| create gateway                                      | GatewayRepository                 | Unit           | WB/statement coverage   |
| error create gateway if the network does not exist | GatewayRepository                 | Unit           | WB/statement coverage   |
| create gateway: conflict                           | GatewayRepository                 | Unit           | WB/statement coverage   |
| ConflictError if new MAC address already exists    | GatewayRepository                 | Unit           | WB/statement coverage   |
| get all gateways                                   | GatewayRepository                 | Unit           | WB/statement coverage   |
| NotFoundError if network does not exist in getAllGateways | GatewayRepository          | Unit           | WB/statement coverage   |
| get gateway: not found                             | GatewayRepository                 | Unit           | WB/statement coverage   |
| update gateway                                     | GatewayRepository                 | Unit           | WB/statement coverage   |
| update a gateway with partial fields              | GatewayRepository                 | Unit           | WB/statement coverage   |
| update all fields of a gateway                    | GatewayRepository                 | Unit           | WB/statement coverage   |
| NotFoundError if network does not exist when updating a gateway | GatewayRepository     | Unit           | WB/statement coverage   |
| NotFoundError if gateway does not exist when updating | GatewayRepository           | Unit           | WB/statement coverage   |
| delete gateway                                     | GatewayRepository                 | Unit           | WB/statement coverage   |
| error deleting a non-existent gateway             | GatewayRepository                 | Unit           | WB/statement coverage   |
| **Integration Tests (gatewayController.integration.test.ts)** |                                   |                |                         |
| createGateway: should create a new gateway        | GatewayController + Repository    | Integration    | BB/equivalence partitioning |
| getAllGateways: should return all gateways in a network | GatewayController + Repository | Integration    | BB/equivalence partitioning |
| getGateway: should return a specific gateway      | GatewayController + Repository    | Integration    | BB/equivalence partitioning |
| getGateway: should throw NotFoundError if gateway does not exist | GatewayController + Repository | Integration    | BB/equivalence partitioning |
| updateGateway: should update a gateway            | GatewayController + Repository    | Integration    | BB/equivalence partitioning |
| deleteGateway: should delete a gateway            | GatewayController + Repository    | Integration    | BB/equivalence partitioning |
| **End-to-End Tests (gateways.e2e.test.ts)**        |                                   |                |                         |
| create a gateway                                   | GatewayRoutes                     | E2E            | BB/equivalence partitioning |
| 409 when creating a gateway with a duplicate macAddress | GatewayRoutes                | E2E            | BB/equivalence partitioning |
| retrieve all gateways in a network                | GatewayRoutes                     | E2E            | BB/equivalence partitioning |
| 404 for an invalid networkCode when retrieving gateways | GatewayRoutes                | E2E            | BB/equivalence partitioning |
| retrieve a specific gateway                       | GatewayRoutes                     | E2E            | BB/equivalence partitioning |
| 404 for a non-existent gateway                    | GatewayRoutes                     | E2E            | BB/equivalence partitioning |
| update a gateway                                   | GatewayRoutes                     | E2E            | BB/equivalence partitioning |
| 404 when updating a non-existent gateway          | GatewayRoutes                     | E2E            | BB/equivalence partitioning |
| delete a gateway                                   | GatewayRoutes                     | E2E            | BB/equivalence partitioning |
| should return 404 when deleting a non-existent gateway | GatewayRoutes                | E2E            | BB/equivalence partitioning |
| **Unit Tests (SensorRepository.db.test.ts)**       |                                   |                |                         |
| create sensor                                      | SensorRepository                  | Unit           | WB/statement coverage   |
| NotFoundError if the network does not exist       | SensorRepository                  | Unit           | WB/statement coverage   |
| NotFoundError if the gateway does not exist       | SensorRepository                  | Unit           | WB/statement coverage   |
| ConflictError if the sensor already exists        | SensorRepository                  | Unit           | WB/statement coverage   |
| get all sensors                                   | SensorRepository                  | Unit           | WB/statement coverage   |
| empty array if no sensors are found for a valid gateway | SensorRepository             | Unit           | WB/statement coverage   |
| NotFoundError if network does not exist in getAllSensor | SensorRepository             | Unit           | WB/statement coverage   |
| NotFoundError if gateway does not exist in getAllSensor | SensorRepository             | Unit           | WB/statement coverage   |
| get sensor by MAC                                 | SensorRepository                  | Unit           | WB/statement coverage   |
| NotFoundError if MAC does not exist               | SensorRepository                  | Unit           | WB/statement coverage   |
| NotFoundError if sensorMac exists but is associated with a different gateway | SensorRepository | Unit           | WB/statement coverage   |
| update sensor                                     | SensorRepository                  | Unit           | WB/statement coverage   |
| update sensor with partial fields                | SensorRepository                  | Unit           | WB/statement coverage   |
| NotFoundError if network does not exist when updating a sensor | SensorRepository         | Unit           | WB/statement coverage   |
| NotFoundError if gateway does not exist when updating a sensor | SensorRepository         | Unit           | WB/statement coverage   |
| NotFoundError if sensor does not exist when updating | SensorRepository             | Unit           | WB/statement coverage   |
| ConflictError if new MAC address already exists when updating | SensorRepository         | Unit           | WB/statement coverage   |
| should retain all fields if no new fields are provided in updateSensor | SensorRepository     | Unit           | WB/statement coverage   |
| delete sensor                                     | SensorRepository                  | Unit           | WB/statement coverage   |
| NotFoundError error deleting a non-existent sensor | SensorRepository               | Unit           | WB/statement coverage   |
| NotFoundError if sensorMac exists but is associated with a different gateway | SensorRepository | Unit           | WB/statement coverage   |
| **Integration Tests (sensorController.integration.test.ts)** |                                   |                |                         |
| createSensor: should create a new sensor                    | SensorController + Repository     | Integration    | BB/equivalence partitioning |
| ConflictError if sensor already exists                      | SensorController + Repository     | Integration    | BB/equivalence partitioning |
| getAllSensor: should return all sensors in a gateway        | SensorController + Repository     | Integration    | BB/equivalence partitioning |
| getAllSensor: should return an empty array if no sensors exist | SensorController + Repository  | Integration    | BB/equivalence partitioning |
| getSensorByMac: should return a specific sensor             | SensorController + Repository     | Integration    | BB/equivalence partitioning |
| NotFoundError if sensor does not exist                      | SensorController + Repository     | Integration    | BB/equivalence partitioning |
| updateSensor: should update a sensor                        | SensorController + Repository     | Integration    | BB/equivalence partitioning |
| NotFoundError if sensor does not exist when updating        | SensorController + Repository     | Integration    | BB/equivalence partitioning |
| deleteSensorByMac: should delete a sensor                   | SensorController + Repository     | Integration    | BB/equivalence partitioning |
| NotFoundError if sensor does not exist when deleting        | SensorController + Repository     | Integration    | BB/equivalence partitioning |
| **End-to-End Tests (sensors.e2e.test.ts)**                  |                                   |                |                         |
| create a sensor                                             | SensorRoutes                      | E2E            | BB/equivalence partitioning |
| 409 when creating a sensor with a duplicate macAddress      | SensorRoutes                      | E2E            | BB/equivalence partitioning |
| retrieve all sensors in a gateway                          | SensorRoutes                      | E2E            | BB/equivalence partitioning |
| 404 for an invalid gatewayMac when retrieving sensors       | SensorRoutes                      | E2E            | BB/equivalence partitioning |
| retrieve a specific sensor                                  | SensorRoutes                      | E2E            | BB/equivalence partitioning |
| 404 for a non-existent sensor                              | SensorRoutes                      | E2E            | BB/equivalence partitioning |
| update a sensor                                             | SensorRoutes                      | E2E            | BB/equivalence partitioning |
| 404 when updating a non-existent sensor                    | SensorRoutes                      | E2E            | BB/equivalence partitioning |
| delete a sensor                                             | SensorRoutes                      | E2E            | BB/equivalence partitioning |
| should return 404 when deleting a non-existent sensor      | SensorRoutes                      | E2E            | BB/equivalence partitioning |

# Coverage

## Coverage of FR

<Report in the following table the coverage of functional requirements and scenarios(from official requirements) >

| Functional Requirement or scenario | Test(s)                                                                 |
| :--------------------------------: | :---------------------------------------------------------------------: |
|                FR1.1               |                                                                         |
|                FR2.1               |                                                                         |
|                FR2.2               |                                                                         |
|                FR2.3               |                                                                         |
|                FR2.4               |                                                                         |
|                FR3.1               |                                                                         |
|                FR3.2               |                                                                         |
|                FR3.3               |                                                                         |
|                FR3.4               |                                                                         |
|                FR3.5               |                                                                         |
|                FR4.1               | retrieve all gateways in a network, 404 for an invalid networkCode when retrieving gateways |
|                FR4.2               | create a gateway, 409 when creating a gateway with a duplicate macAddress |
|                FR4.3               | retrieve a specific gateway, 404 for a non-existent gateway            |
|                FR4.4               | update a gateway, 404 when updating a non-existent gateway             |
|                FR4.5               | delete a gateway, should return 404 when deleting a non-existent gateway |
|                FR5.1               | retrieve all sensors in a gateway, 404 for an invalid gatewayMac when retrieving sensors |
|                FR5.2               | create a sensor, 409 when creating a sensor with a duplicate macAddress |
|                FR5.3               | retrieve a specific sensor, 404 for a non-existent sensor              |
|                FR5.4               | update a sensor, 404 when updating a non-existent sensor               |
|                FR5.5               | delete a sensor, should return 404 when deleting a non-existent sensor |
|                FR6.1               |                                                                         |
|                FR6.2               |                                                                         |
|                FR6.3               |                                                                         |
|                FR6.4               |                                                                         |
|                FR6.5               |                                                                         |
|                FR6.6               |                                                                         |
|                FR6.7               |                                                                         |

## Coverage white box

Report here the screenshot of coverage values obtained with jest-- coverage
