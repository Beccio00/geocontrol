# Requirements Document - GeoControl

Date:

Version: V1 - description of Geocontrol as described in the swagger

| Version number | Change |
| :------------: | :----: |
|                |        |

# Contents

- [Requirements Document - GeoControl](#requirements-document---geocontrol)
- [Contents](#contents)
- [Informal description](#informal-description)
- [Business Model](#business-model)
- [Stakeholders](#stakeholders)
- [Context Diagram and interfaces](#context-diagram-and-interfaces)
  - [Context Diagram](#context-diagram)
  - [Interfaces](#interfaces)
- [Stories and personas](#stories-and-personas)
      - [case 1.](#case-1)
      - [case 2.](#case-2)
      - [case 3.](#case-3)
- [Functional and non functional requirements](#functional-and-non-functional-requirements)
  - [Functional Requirements](#functional-requirements)
  - [Non Functional Requirements](#non-functional-requirements)
- [Use case diagram and use cases](#use-case-diagram-and-use-cases)
  - [Use case diagram](#use-case-diagram)
    - [Use case 1, UC1](#use-case-1-uc1)
        - [Scenario 1.1](#scenario-11)
        - [Scenario 1.2](#scenario-12)
        - [Scenario 1.x](#scenario-1x)
    - [Use case 2, UC2](#use-case-2-uc2)
    - [Use case x, UCx](#use-case-x-ucx)
- [Glossary](#glossary)
- [System Design](#system-design)
- [Deployment Diagram](#deployment-diagram)

# Informal description

GeoControl è un sistema software progettato per monitorare variabili fisiche e ambientali in diversi contesti: dalle analisi idrogeologiche di aree montane alla sorveglianza di edifici storici, fino al controllo di parametri interni (come temperatura o illuminazione) in ambienti residenziali o lavorativi.

# Business Model

Il prodotto è commissionato inizialmente dall' Unione delle Comunità Montane della regione Piemonte per la gestione dello stato idrogeologico del territorio, che quindi paga per il prodotto, lasciando i diritti sul software all'azienda sviluppatrice. <br> GeoControl, grazie alla struttura modulare del software, ha potuto commercializzare il prodotto immettendolo sul mercato con il fine di distribuirlo ad altre diverse entità pubbliche e private. 

- Le aziende private possono decidere di richiedere una valutazione per l’installazione dei sensori richiesti. La spesa come preventivo sarà eventualmente rimborsato se l’azienda decidesse di firmare il contratto. Il contratto avrà una scadenza decennale, quinquennale, triennale con la possibilità di ricevere uno sconto nel caso le aziende decidessero di avere un piano che copre più anni, il pagamento avviene annualmente. Inoltre ci saranno piani diversi a seconda di quanti sensori l’azienda può installare: 
 
  - Contratto base: numero di sensori basso (es. 50 sensori)
  - Contratto business: numero di sensori elevato (es. 250 sensori)
  - Contratto pro: numero di sensori illimitato → chiedere numero di sensori
- Gli enti pubblici possono usurfruire di sconti per contratti pro da contrattulaizzare caso per caso
- •	Fornitura, installazione e la manutenzione di sensori e gateway è affidato a un’azienda esterna affiliata a GeoControl.

# Stakeholders

| Stakeholder name | Description |
| :--------------: | :---------: |
| Stakeholder x..  |             |

# Context Diagram and interfaces

## Context Diagram

\<Define here Context diagram using UML use case diagram>

\<actors are a subset of stakeholders>

## Interfaces

\<describe here each interface in the context diagram>


|   Actor   | Logical Interface | Physical Interface |
| :-------: | :---------------: | :----------------: |
| Actor x.. |                   |                    |

# Stories and personas

#### case 1.
L'organizzazione privata che possiede una residenza storica sul lago di Como è interessata a monitorare parametri quali umidità e temperatura degli ambienti per mantenere in buono stato le opere d'arte e gli affrischi all'interno. <br>
Si rivolge a questo sistema che gli ermettera di avere accesso ai dati di tutta l'abitaizone e quindi intervenire nel caso i parametri non siano soddisfacenti 

#### case 2.
L'azienda che gestisce un tratto autostradale è interessata a monitorare le condizioni di una parete rocciosa instabile che potrebbe subire distacchi di detriti e mettere quindi in pericolo la circolazione. <br> E' alla ricerca quindi di un sistema come il nostro che garantisce scalabilità e un'alto standard di reliability (max 3 misurazioni all'anno per sensore perse).

#### case 3.
Un piccolo comune siciliano è interessato al sistema che vorrebbe usare per monitorare lo stato di un edificio storico al centro del loro paese per il rischio di assestamenti naturali del terreno argilloso che potrebbero compromettere alla lunga le fondamenta dell'edificio. <br>
Sono attratti in particolare dal fatto che il sistema è stato sviluppato su commisisone di un ente pubblico e rispetta le caratteristiche che un ente come il loro cerca.

# Functional and non functional requirements

## Functional Requirements

|  ID   | Description |
| :---: | :---------: |
|  FR1  | Autenticazione con token univoco  |
|||
|  FR2  | Gestione utenti|
| 2.1 | Creazione nuovo utente |
| 2.2 | Eliminazione di un utente |
| 2.3 | Accesso alla lista degli utenti |
| 2.4 | Accesso ad uno specifico utente |
|||
|  FR3  | Gestione delle reti|
| 3.1 | Creazione di una nuova rete |
| 3.2 | Aggiornamento di una rete esistente |
| 3.3 | Eliminazione di una rete |
| 3.4 | Accesso ad una rete specifica |
| 3.5 | Accesso a tutte le reti |
|||
|  FR4  | Gestione dei gateway|
| 4.1 | Creazione di un nuovo gateway nella rete |
| 4.2 | Aggiornamento di un gateway esistente |
| 4.3 | Eliminazione di un gateway esistente |
| 4.4 | Accesso a tutti i gateway di una rete |
| 4.5 | Accesso ad uno specifico gateway |
|||
|  FR5  | Gestione dei sensori |
| 5.1 | Creazione di un nuovo sensore |
| 5.2 | Aggiornamento di un sensore esistente |
| 5.3 | Eliminazione di un sensore esistente |
| 5.4 | Accesso a tutti i sensori di un gateway |
| 5.5 | Accesso ad uno specifico sensore |
|||
|  FR6  | Gestione delle misurazioni |
| 6.1 | Archiviazione delle misurazioni di un sensore |
| 6.2 | Gestione dei timestamp |
| 6.2.1 | Conversione in formato ISO 8601 con riferimento UTC |
| 6.2.2 | Conversione in fuso orario locale per l’accesso ai dati |
| 6.3 | Accesso alle misurazioni di un set di sensori di una rete |
| 6.4 | Accesso alle misurazioni di uno specifico sensore |
|||
|  FR7  | Gestione delle statistiche |
| 7.1 | Calcolo delle media |
| 7.2 | Calcolo della varianza |
| 7.3 | Calcolo delle soglie |
| 7.4 | Identificazione di anomalie secondo soglie |
| 7.5 | Accesso alle statistiche di un set di sensori di una specifica rete |
| 7.6 | Accesso alle anomalie di un set di sensori di una specifica rete |
| 7.7 | Accesso alle statistiche di un sensore |
| 7.8 | Accesso alle anomalie di un sensore |
|||

## Non Functional Requirements

\<Describe constraints on functional requirements>

|   ID    | Type (efficiency, reliability, ..) | Description | Refers to |
| :-----: | :--------------------------------: | :---------: | :-------: |
|  NFR1   |                                    |             |           |
|  NFR2   |                                    |             |           |
|  NFR3   |                                    |             |           |
| NFRx .. |                                    |             |           |

# Use case diagram and use cases

## Use case diagram

\<define here UML Use case diagram UCD summarizing all use cases, and their relationships>

\<next describe here each use case in the UCD>

### Use case 1, UC1

| Actors Involved  |                                                                      |
| :--------------: | :------------------------------------------------------------------: |
|   Precondition   | \<Boolean expression, must evaluate to true before the UC can start> |
|  Post condition  |  \<Boolean expression, must evaluate to true after UC is finished>   |
| Nominal Scenario |         \<Textual description of actions executed by the UC>         |
|     Variants     |                      \<other normal executions>                      |
|    Exceptions    |                        \<exceptions, errors >                        |

##### Scenario 1.1

\<describe here scenarios instances of UC1>

\<a scenario is a sequence of steps that corresponds to a particular execution of one use case>

\<a scenario is a more formal description of a story>

\<only relevant scenarios should be described>

|  Scenario 1.1  |                                                                            |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | \<Boolean expression, must evaluate to true before the scenario can start> |
| Post condition |  \<Boolean expression, must evaluate to true after scenario is finished>   |
|     Step#      |                                Description                                 |
|       1        |                                                                            |
|       2        |                                                                            |
|      ...       |                                                                            |

##### Scenario 1.2

##### Scenario 1.x

### Use case 2, UC2

..

### Use case x, UCx

..

# Glossary

\<use UML class diagram to define important terms, or concepts in the domain of the application, and their relationships>

\<concepts must be used consistently all over the document, ex in use cases, requirements etc>

# System Design

\<describe here system design>

\<must be consistent with Context diagram>

# Deployment Diagram

\<describe here deployment diagram >
