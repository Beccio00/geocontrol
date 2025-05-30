# Test Report


# Contents

- [Test Report](#test-report)
- [Contents](#contents)
- [Dependency graph](#dependency-graph)
- [Integration approach](#integration-approach)
    - [unit test](#unit-test)
      - [unit test repository](#unit-test-repository)
      - [unit test mesurement service](#unit-test-mesurement-service)
    - [integration test](#integration-test)
      - [integration test controller](#integration-test-controller)
      - [integration test routes](#integration-test-routes)
    - [e2e test](#e2e-test)
- [Tests](#tests)
- [Coverage](#coverage)
  - [Coverage of FR](#coverage-of-fr)
  - [Coverage white box](#coverage-white-box)

# Dependency graph

![Grafico delle dipendenze](./images/dependencyGraph.png)


# Integration approach

  In generale l'approccio utilizzato è stato quello bottom up, considerando in maniera indipendente la logica per i sensori, gateway, network, misure,autenticazione e utenti. <br>
  Essendo la gestione delle misure non parallelizzabile come la gestione di network, gateway e sensori l'approccio è variato leggermente, sono ifatti stati inclusi a unit test per testare il servizio measurament

  ### unit test 
  
  #### unit test repository
   Utilizzando jest ed i mock è testata la logica vera e propria delle funzioni, approcio white box
  #### unit test mesurement service
  - Essendo la logica di questo servizio una parte importante della logica dell'applicazione <br> sono stati eseguiti degli unit test mirati a questo servizio
  
  ### integration test
  ####  integration test controller
  - Testano l'integrazione fra il controller layer, il service layer (mapper Dao Dto), il repository e il database vero e proprio,<br> infatti questi test sono eseguiti utilizzando un database di test e non un mock di esso
  #### integration test routes
  - Testano l'integrazione fra il layer route, authentication, controller e validation, <br> con alcuni test che chiamano in gioco anche il middleware di gestione errori. <br> Sono eseguiti usando jest e i mock , non ci sono vere interazioni col db, controller e servizio di autenticazione vengono simulati
  ### e2e test
  - Test completo dell'intera applicazione compreso database e servizio http, <br> verifica il corretto funzionamento dell'applicazione compresa la generazione di token per l'autenticazione e lettura e scrittura da database. <br> Sempre eseguito per strati

    

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


# Coverage

## Coverage of FR

<Report in the following table the coverage of functional requirements and scenarios(from official requirements) >

| Functional Requirement or scenario | Test(s)                                                                 |
| :--------------------------------: | :---------------------------------------------------------------------: |
|                FR1.1               |  authentication 3 user types, token generation, wrong username o password  |
|                FR2.1               | get all users, wrong token, unauthorized, insufficient rights    |
|                FR2.2               | create user, vari tipi, conflict error, unauthorized, insufficient rights, conflict error   |
|                FR2.3               | get user, not found, unauthorized, insufficient rights                  |
|                FR2.4               | delete user, not found, unauthorized, insufficient rights            |
| | |
|                FR3.1               | get all networks, insufficient rights, unauthorized |
|                FR3.2               | create network, insufficient rights, unauthorized, duplicated code, input validation, ignore nested gateways |
|                FR3.3               | get network, insufficient rights, unauthorized, non existing network (not found) |
|                FR3.4               | update network, insufficient rights, unauthorized, not found, iput validation, code already exists, ignore gateways|
|                FR3.5               | delete network, insufficient rights, unauthorized, not found |
| | |
|                FR4.1               | get all gateways in a network,  insufficient rights, unauthorized, invalid network |
|                FR4.2               | create gateway, insufficient rights, unauthorized, duplicated mac, input validation, ignore nested sensors, invalid network |
|                FR4.3               | get gateway, insufficient rights, unauthorized, not found, invalid network |
|                FR4.4               | update gateway, insufficient rights, unauthorized, not found, input validation, code already exists, ignore sensors|
|                FR4.5               | delete gateway, insufficient rights, unauthorized, not found, invalid network |
| | |
|                FR5.1               | get all sensors in a gateway, insufficient rights, unauthorized, invalid network/gateway |
|                FR5.2               | create sensor, insufficient rights, unauthorized, duplicated mac, input validation, invalid network/gateway |
|                FR5.3               | get sensor, insufficient rights, unauthorized, not found, invalid network/gateway   |
|                FR5.4               | update a sensor, insufficient rights, unauthorized, not found, input validation, code already exists |
|                FR5.5               | delete a sensor, insufficient rights, unauthorized, not found, invalid network/gateway |
| | |
|                FR6.1               |                                                                         |
|                FR6.2               |                                                                         |
|                FR6.3               |                                                                         |
|                FR6.4               |                                                                         |
|                FR6.5               |                                                                         |
|                FR6.6               |                                                                         |
|                FR6.7               |                                                                         |

## Coverage white box

La copertura risultante è quasi completa, la statement coverage è sempre sopra l'80% e spesso totale, si può notare un calo di copertura nel file utils.ts nel quale non è stata testata un porzione di una funzione, perché non è stata usata nel codice.

![coverage value](./images/test-report.jpg)
