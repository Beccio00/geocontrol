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

|   ID    | Tipo | Descrizione | Riferito a |
| :-----: | :--------------------------------: | :---------: | :-------: |
|  NFR1   |    dominio  | timestamp in formato ISO 8601 |   FR 6.2    |
|  NFR2   |        dominio       | unità di misura del SI |   FR 6  |
|  NFR3   |        dominio       | Gli elementi del sistema sono identificati univocamente| FR 3, FR 4, FR 5    |
|  NFR4   |        affidabilità   | il sistema non deve perdere più di 6 misurazioni all'anno (per sensore)|    FR6    |
|  NFR5   | usabilità | l'utente viewer non deve avere bisogno di training |    FR 2    |
|  NFR6   | usabilità | un utente 'operatore' deve imparare a usare il software in meno di 16 ore di training |   FR 2     |
|  NFR7   | usabilità | un utente 'admin' deve imparare a usare il software in meno di 24 ore di training |   FR 2     |
|  NFR8   |  sicurezza      | protenzione da accessi esterni | FR1 |
|  NFR9  |  portabilità     | L’applicazione web deve essere disponibile sui seguenti browser: • Chrome (da versione ...) • Firefox (da versione ...) • Safari • Opera| Tutti  |



# Use case diagram and use cases

## Use case diagram

\<define here UML Use case diagram UCD summarizing all use cases, and their relationships>

\<next describe here each use case in the UCD>

# Use Cases and Scenarios


## Use Case 1 – Autenticazione

| **Attori Coinvolti** | utente, sistema                                                 |
|:--------------------:|:--------------------------------------------------------------: |
| **Precondizione**    | nessun utente risulta autenticato su questa postazione          |
| **Postcondizione**   | l’utente è autenticato; il sistema ha generato un token valido  |
| **Scenario Nominale** | [Scenario 1.1 – Autenticazione valida](#scenario-11--autenticazione-valida) |
| **Eccezioni**        | [Scenario 1.2 – Autenticazione fallita](#scenario-12--autenticazione-fallita) |

### Scenario 1.1 – Autenticazione valida

| Scenario 1.1       | Autenticazione valida                                            |
|:------------------:|:----------------------------------------------------------------:|
| **Precondizione**  | nessun utente è autenticato                                     |
| **Postcondizione** | l’utente è autenticato, viene generato il token                 |
| **Passi**          |                                                                  |
| **Passo 1**        | L’utente richiede di loggarsi                                    |
| **Passo 2**        | Il sistema fornisce il form di login (username/password)         |
| **Passo 3**        | L’utente compila il form correttamente                           |
| **Passo 4**        | Il sistema genera il token e autentica l’utente                  |

### Scenario 1.2 – Autenticazione fallita

| Scenario 1.2       | Autenticazione fallita                                             |
|:------------------:|:------------------------------------------------------------------:|
| **Precondizione**  | nessun utente è autenticato                                       |
| **Postcondizione** | nessun utente risulta autenticato, il form resta vuoto            |
| **Passi**          |                                                                    |
| **Passo 1**        | L’utente richiede di loggarsi                                     |
| **Passo 2**        | Il sistema fornisce il form di login                              |
| **Passo 3**        | L’utente inserisce credenziali errate                             |
| **Passo 4**        | Il sistema avvisa dell’errore                                     |
| **Passo 5**        | Il sistema ripresenta il form di login (vuoto)                    |

---

## Use Case 2 – Creazione Utente

| **Attori Coinvolti** | Utente Amministratore, Sistema                                          |
|:--------------------:|:----------------------------------------------------------------------: |
| **Precondizione**    | L’Utente Amministratore è autenticato                                   |
| **Postcondizione**   | un nuovo utente risulta creato nel sistema                              |
| **Scenario Nominale** | [Scenario 2.1 – Creazione utente con successo](#scenario-21--creazione-utente-con-successo) |
| **Eccezioni**        | [Scenario 2.2 – Creazione utente fallita](#scenario-22--creazione-utente-fallita) |

### Scenario 2.1 – Creazione utente con successo

| Scenario 2.1       | Creazione utente con successo                                       |
|:------------------:|:-------------------------------------------------------------------:|
| **Precondizione**  | utente amministratore autenticato              |
| **Postcondizione** | il nuovo utente è registrato nel sistema                           |
| **Passi**          |                                                                     |
| **Passo 1**        | L’utente amministratore richiede di creare un nuovo utente                         |
| **Passo 2**        | Il sistema presenta un form con username, password, ruolo          |
| **Passo 3**        | L’utente amministratore compila correttamente il form                              |
| **Passo 4**        | Il sistema valida i dati immessi                                   |
| **Passo 5**        | Il sistema registra il nuovo utente                                |
| **Passo 6**        | Il sistema conferma l’avvenuta creazione                           |

### Scenario 2.2 – Creazione utente fallita

| Scenario 2.2       | Creazione utente fallita                                          |
|:------------------:|:-----------------------------------------------------------------:|
| **Precondizione**  | utente amministratore autenticato            |
| **Postcondizione** | nessun nuovo utente è creato, il sistema è invariato             |
| **Passi**          |                                                                   |
| **Passo 1**        | L’utente amministratore richiede di creare un nuovo utente                       |
| **Passo 2**        | Il sistema presenta il form (username, password, ruolo)          |
| **Passo 3**        | L’utente amministratore compila in modo errato o con dati duplicati              |
| **Passo 4**        | Il sistema rileva l’errore                                       |
| **Passo 5**        | Il sistema notifica l’errore e chiede di reinserire i dati       |
| **Passo 6**        | Il sistema ripresenta il form con eventuali campi da correggere  |

---

## Use Case 3 – Modifica Utente

| **Attori Coinvolti** | Utente Amministratore, Sistema                                       |
|:--------------------:|:--------------------------------------------------------------------:|
| **Precondizione**    | Amministratore autenticato; l’utente target esiste             |
| **Postcondizione**   | l’utente target risulta aggiornato nei campi desiderati                  |
| **Scenario Nominale** | [Scenario 3.1 – Modifica utente con successo](#scenario-31--modifica-utente-con-successo) |
| **Eccezioni**        | [Scenario 3.2 – Modifica utente fallita](#scenario-32--modifica-utente-fallita) |

### Scenario 3.1 – Modifica utente con successo

| Scenario 3.1       | Modifica utente con successo                                          |
|:------------------:|:---------------------------------------------------------------------:|
| **Precondizione**  | Amministratore autenticato, l’utente target esiste                             |
| **Postcondizione** | l’utente target risulta aggiornato nei campi desiderati               |
| **Passi**          |                                                                       |
| **Passo 1**        | L’utente amministratore richiede di modificare un utente  |
| **Passo 2**        | Il sistema recupera i dati attuali dell’utente                        |
| **Passo 3**        | L’utente amministratore modifica i campi desiderati                                   |
| **Passo 4**        | Il sistema valida i nuovi dati                                        |
| **Passo 5**        | Il sistema aggiorna i dati                               |
| **Passo 6**        | Il sistema notifica la modifica avvenuta                              |

### Scenario 3.2 – Modifica utente fallita

| Scenario 3.2       | Modifica utente fallita                                              |
|:------------------:|:--------------------------------------------------------------------:|
| **Precondizione**  | utente amministratore autenticato, utente target esiste                              |
| **Postcondizione** | l’utente non viene modificato, compare un messaggio d’errore        |
| **Passi**          |                                                                       |
| **Passo 1**        | L’utente amministratore richiede la modifica di un utente                           |
| **Passo 2**        | Il sistema mostra i dati da modificare                              |
| **Passo 3**        | L’utente amministratore inserisce valori non validi (duplicati, formati errati)     |
| **Passo 4**        | Il sistema rileva l’errore e lo notifica                            |
| **Passo 5**        | Il sistema rifiuta la modifica e ripresenta i dati attuali          |

---

## Use Case 4 – Eliminazione Utente

| **Attori Coinvolti** | Utente Amministratore, Sistema                                              |
|:--------------------:|:--------------------------------------------------------------------------: |
| **Precondizione**    | utente amministratore autenticato; l’utente target compare nella lista utenti                     |
| **Postcondizione**   | l’utente selezionato risulta eliminato                  |
| **Scenario Nominale** | [Scenario 4.1 – Eliminazione utente con successo](#scenario-41--eliminazione-utente-con-successo) |
| **Eccezioni**        | [Scenario 4.2 – Eliminazione utente fallita](#scenario-42--eliminazione-utente-fallita) |

### Scenario 4.1 – Eliminazione utente con successo

| Scenario 4.1       | Eliminazione utente con successo                                   |
|:------------------:|:------------------------------------------------------------------:|
| **Precondizione**  | utente amministratore autenticato, l’utente target compare nella lista utenti      |
| **Postcondizione** | l’utente selezionato è rimosso dal sistema                         |
| **Passi**          |                                                                    |
| **Passo 1**        | L’utente amministratore richiede di eliminare un utente                           |
| **Passo 2**        | Il sistema chiede conferma dell’eliminazione                      |
| **Passo 3**        | L’utente amministratore conferma l’operazione                                     |
| **Passo 4**        | Il sistema elimina l’utente e notifica l’esito positivo           |

### Scenario 4.2 – Eliminazione utente fallita

| Scenario 4.2       | Eliminazione utente fallita                                             |
|:------------------:|:----------------------------------------------------------------------:|
| **Precondizione**  | utente amministratore autenticato, l’utente target è visibile nella lista utenti              |
| **Postcondizione** | l’utente non viene rimosso, appare un messaggio d’errore               |
| **Passi**          |                                                                         |
| **Passo 1**        | L’utente amministratore richiede di eliminare un utente                           |
| **Passo 2**        | Il sistema chiede conferma                                              |
| **Passo 3**        | L’utente amministratore conferma l’operazione                                          |
| **Passo 4**        | Il sistema non può eliminare l’utente (es. è l’unico utente amministratore)            |
| **Passo 5**        | Il sistema mostra un messaggio d’errore e annulla l’operazione         |

---

## Use Case 5 – Visualizzare Lista Utenti

| **Attori Coinvolti** | Utente Amministratore, Sistema                                 |
|:--------------------:|:-------------------------------------------------------------: |
| **Precondizione**    | utente amministratore autenticato                                              |
| **Postcondizione**   | viene mostrata la lista degli utenti                           |
| **Scenario Nominale** | [Scenario 5.1 – Lista utenti con successo](#scenario-51--lista-utenti-con-successo) |
| **Eccezioni**        | [Scenario 5.2 – Errore nel recupero della lista](#scenario-52--errore-nel-recupero-della-lista) |

### Scenario 5.1 – Lista utenti con successo

| Scenario 5.1       | Lista utenti mostrata con successo                               |
|:------------------:|:----------------------------------------------------------------:|
| **Precondizione**  | utente amministratore autenticato                                               |
| **Postcondizione** | la lista di tutti gli utenti è visibile                         |
| **Passi**          |                                                                  |
| **Passo 1**        | L’utente amministratore richiede l'elenco degli utenti                      |
| **Passo 2**        | Il sistema visualizza la lista                                  |

### Scenario 5.2 – Errore nel recupero della lista

| Scenario 5.2       | Errore nel recupero della lista utenti                         |
|:------------------:|:--------------------------------------------------------------:|
| **Precondizione**  | utente amministratore autenticato                                             |
| **Postcondizione** | la lista non viene mostrata, appare un messaggio di errore    |
| **Passi**          |                                                                |
| **Passo 1**        | L’utente amministratore richiede la lista utenti                    |
| **Passo 2**        | Un problema impedisce la lettura |
| **Passo 3**        | Il sistema mostra un errore                                   |

---

## Use Case 6 – Visualizzare Dettaglio Utente

| **Attori Coinvolti** | Utente Amministratore, Sistema                                            |
|:--------------------:|:------------------------------------------------------------------------: |
| **Precondizione**    | utente amministratore autenticato; l’utente target esiste                    |
| **Postcondizione**   | vengono mostrati i dettagli dell’utente selezionato                      |
| **Scenario Nominale** | [Scenario 6.1 – Visualizzazione dettaglio utente con successo](#scenario-61--visualizzazione-dettaglio-utente-con-successo) |
| **Eccezioni**        | [Scenario 6.2 – Errore di lettura dettaglio utente](#scenario-62--errore-di-lettura-dettaglio-utente) |

### Scenario 6.1 – Visualizzazione dettaglio utente con successo

| Scenario 6.1       | Visualizzazione dettaglio utente con successo                    |
|:------------------:|:----------------------------------------------------------------:|
| **Precondizione**  | utente amministratore autenticato, l’utente target esiste                        |
| **Postcondizione**   | vengono mostrati i dettagli dell’utente selezionato                      |
| **Passi**          |                                                                  |
| **Passo 1**        | L’utente amministratore seleziona l’utente                      |
| **Passo 2**        | Il sistema visualizza i dettagli dell’utente richiesto          |

### Scenario 6.2 – Errore di lettura dettaglio utente

| Scenario 6.2       | Errore di lettura dettaglio utente                                |
|:------------------:|:-----------------------------------------------------------------:|
| **Precondizione**  | utente amministratore autenticato                                                |
| **Postcondizione** | il sistema non mostra alcun dettaglio, viene segnalato l’errore |
| **Passi**          |                                                                   |
| **Passo 1**        | L’utente amministratore seleziona l’utente da visualizzare                      |
| **Passo 2**        | I dati non sono disponibili  |
| **Passo 3**        | Il sistema mostra un errore                                     |

---

## Use Case 7 – Creare Rete

| **Attori Coinvolti** | utente amministratore o operatore, Sistema                              |
|:--------------------:|:-----------------------------------------------------:|
| **Precondizione**    | l’utente amministratore o operatore è autenticato            |
| **Postcondizione**   | una nuova rete risulta inserita                       |
| **Scenario Nominale** | [Scenario 7.1 – Creazione rete con successo](#scenario-71--creazione-rete-con-successo) |
| **Eccezioni**        | [Scenario 7.2 – Creazione rete fallita](#scenario-72--creazione-rete-fallita) |

### Scenario 7.1 – Creazione rete con successo

| Scenario 7.1       | Creazione rete con successo                                 |
|:------------------:|:-----------------------------------------------------------:|
| **Precondizione**    | l’utente amministratore o operatore è autenticato            |
| **Postcondizione**   | una nuova rete risulta inserita                       |
| **Passi**          |                                                             |
| **Passo 1**        | L’utente richiede la creazione di una nuova rete           |
| **Passo 2**        | Il sistema presenta un form con i campi necessari |
| **Passo 3**        | L’utente compila correttamente il form                     |
| **Passo 4**        | Il sistema valida i dati                                    |
| **Passo 5**        | Il sistema inserisce la rete                                |
| **Passo 6**        | Il sistema notifica l’esito positivo                        |

### Scenario 7.2 – Creazione rete fallita

| Scenario 7.2       | Creazione rete fallita                                       |
|:------------------:|:-----------------------------------------------------------:|
| **Precondizione**    | l’utente amministratore o operatore è autenticato            |
| **Postcondizione** | nessuna nuova rete risulta creata                           |
| **Passi**          |                                                             |
| **Passo 1**        | L’utente richiede creazione rete                            |
| **Passo 2**        | Il sistema presenta un form con i campi necessari |
| **Passo 3**        | L’utente compila in modo errato       |
| **Passo 4**        | Il sistema rileva l’errore e lo notifica                    |
| **Passo 5**        | Il sistema chiede di correggere i dati                      |

---

## Use Case 8 – Modificare Rete

| **Attori Coinvolti** | utente amministratore o operatore, Sistema                              |
|:--------------------:|:-----------------------------------------------------:|
| **Precondizione**    | l’utente amministratore o operatore è autenticato;  la rete target esiste    |
| **Postcondizione**   | la rete risulta modificata nei campi desiderati       |
| **Scenario Nominale** | [Scenario 8.1 – Modifica rete con successo](#scenario-81--modifica-rete-con-successo) |
| **Eccezioni**        | [Scenario 8.2 – Modifica rete fallita](#scenario-82--modifica-rete-fallita) |

### Scenario 8.1 – Modifica rete con successo

| Scenario 8.1       | Modifica rete con successo                                     |
|:------------------:|:--------------------------------------------------------------:|
| **Precondizione**    | l’utente amministratore o operatore è autenticato;  la rete target esiste    |
| **Postcondizione**   | la rete risulta modificata nei campi desiderati       |
| **Passi**          |                                                                |
| **Passo 1**        | L’utente richiede modifica di una rete                         |
| **Passo 2**        | Il sistema mostra i dati attuali                               |
| **Passo 3**        | L’utente modifica i campi desiderati                           |
| **Passo 4**        | Il sistema valida i nuovi dati                                 |
| **Passo 5**        | Il sistema registra la modifica                                |
| **Passo 6**        | Il sistema conferma l’operazione                               |

### Scenario 8.2 – Modifica rete fallita

| Scenario 8.2       | Modifica rete fallita                                    |
|:------------------:|:--------------------------------------------------------:|
| **Precondizione**    | l’utente amministratore o operatore è autenticato;  la rete target esiste    |
| **Postcondizione** | la rete resta invariata; errore mostrato                |
| **Passi**          |                                                          |
| **Passo 1**        | L’utente richiede modifica rete                          |
| **Passo 2**        | L’utente inserisce dati invalidi   |
| **Passo 3**        | Il sistema rileva l’errore                               |
| **Passo 4**        | Il sistema notifica l’errore e annulla la modifica      |

---

## Use Case 9 – Eliminare Rete

| **Attori Coinvolti** | utente amministratore o operatore, Sistema                              |
|:--------------------:|:-------------------------------------------------------: |
| **Precondizione**    | l’utente amministratore o operatore è autenticato;  la rete target esiste    |
| **Postcondizione**   | la rete selezionata risulta eliminata                    |
| **Scenario Nominale** | [Scenario 9.1 – Eliminazione rete con successo](#scenario-91--eliminazione-rete-con-successo) |
| **Eccezioni**        | [Scenario 9.2 – Eliminazione rete fallita](#scenario-92--eliminazione-rete-fallita) |

### Scenario 9.1 – Eliminazione rete con successo

| Scenario 9.1       | Eliminazione rete con successo                          |
|:------------------:|:-------------------------------------------------------:|
| **Precondizione**    | l’utente amministratore o operatore è autenticato;  la rete target esiste    |
| **Postcondizione**   | la rete selezionata risulta eliminata                    |
| **Passi**          |                                                        |
| **Passo 1**        | L’utente richiede di eliminare una rete                |
| **Passo 2**        | Il sistema chiede conferma                              |
| **Passo 3**        | L’utente conferma                                      |
| **Passo 4**        | Il sistema elimina la rete e notifica l’esito positivo |

### Scenario 9.2 – Eliminazione rete fallita

| Scenario 9.2       | Eliminazione rete fallita                             |
|:------------------:|:-----------------------------------------------------:|
| **Precondizione**    | l’utente amministratore o operatore è autenticato;  la rete target esiste    |
| **Postcondizione** | la rete resta nel sistema, appare un messaggio d’errore |
| **Passi**          |                                                       |
| **Passo 1**        | L’utente richiede di eliminare una rete                |
| **Passo 2**        | Il sistema chiede conferma                             |
| **Passo 3**        | L’utente conferma                                     |
| **Passo 4**        | Il sistema rileva un impedimento |
| **Passo 5**        | Il sistema mostra l’errore e annulla l’operazione     |

---

## Use Case 10 – Visualizzare Lista Reti

| **Attori Coinvolti** | utente amministratore o operatore, Sistema                              |
|:--------------------:|:------------------------------------------------:|
| **Precondizione**    | l’utente amministratore o operatore è autenticato                      |
| **Postcondizione**   | appare la lista delle reti presenti nel sistema  |
| **Scenario Nominale** | [Scenario 10.1 – Visualizzazione lista reti con successo](#scenario-101--visualizzazione-lista-reti-con-successo) |
| **Eccezioni**        | [Scenario 10.2 – Errore nella visualizzazione lista reti](#scenario-102--errore-nella-visualizzazione-lista-reti) |

### Scenario 10.1 – Visualizzazione lista reti con successo

| Scenario 10.1       | Visualizzazione lista reti con successo                      |
|:-------------------:|:------------------------------------------------------------:|
| **Precondizione**   | l’utente amministratore o operatore è autenticato                                   |
| **Postcondizione**   | appare la lista delle reti presenti nel sistema  |
| **Passi**           |                                                              |
| **Passo 1**         | L’utente richiede la lista delle reti                          |
| **Passo 2**         | Il sistema mostra la lista                                   |

### Scenario 10.2 – Errore nella visualizzazione lista reti

| Scenario 10.2       | Errore nella visualizzazione lista reti                        |
|:-------------------:|:--------------------------------------------------------------:|
| **Precondizione**   | l’utente amministratore o operatore è autenticato                                   |
| **Postcondizione**  | la lista non viene mostrata; appare un messaggio d’errore     |
| **Passi**           |                                                                |
| **Passo 1**         | L’utente richiede la lista delle reti                          |
| **Passo 2**         | Un problema impedisce la lettura                |
| **Passo 3**         | Il sistema notifica l’errore                                  |

---

## Use Case 11 – Visualizzare Dettaglio Rete

| **Attori Coinvolti** | utente amministratore o operatore, Sistema                              |
|:--------------------:|:------------------------------------------------------: |
| **Precondizione**    | utente  amministratore o operatore autenticato; rete esistente             |
| **Postcondizione**   | i dettagli della rete selezionata sono mostrati        |
| **Scenario Nominale** | [Scenario 11.1 – Visualizzare dettaglio rete con successo](#scenario-111--visualizzare-dettaglio-rete-con-successo) |
| **Eccezioni**        | [Scenario 11.2 – Errore visualizzazione dettaglio rete](#scenario-112--errore-visualizzazione-dettaglio-rete) |

### Scenario 11.1 – Visualizzare dettaglio rete con successo

| Scenario 11.1       | Visualizzazione dettaglio rete con successo                 |
|:-------------------:|:-----------------------------------------------------------:|
| **Precondizione**   | utente  amministratore o operatore autenticato, rete esistente                  |
| **Postcondizione**  | il sistema mostra le info della rete  |
| **Passi**           |                                                             |
| **Passo 1**         | L’utente seleziona la rete desiderata                       |
| **Passo 2**         | Il sistema mostra i dettagli                                |

### Scenario 11.2 – Errore visualizzazione dettaglio rete

| Scenario 11.2       | Errore visualizzazione dettaglio rete                    |
|:-------------------:|:--------------------------------------------------------:|
| **Precondizione**   | utente  amministratore o operatore autenticato                               |
| **Postcondizione**  | nessuna informazione visualizzata, compare errore        |
| **Passi**           |                                                          |
| **Passo 1**         | L’utente seleziona la rete                               |
| **Passo 2**         | Il sistema mostra un errore                              |

---

## Use Case 12 – Creare Gateway

| **Attori Coinvolti** | utente amministratore o operatore, Sistema                              |
|:--------------------:|:-----------------------------------------------------------------:|
| **Precondizione**    | utente  amministratore o operatore autenticato; rete disponibile                |
| **Postcondizione**   | un nuovo gateway è creato e associato alla rete                   |
| **Scenario Nominale** | [Scenario 12.1 – Creazione gateway con successo](#scenario-121--creazione-gateway-con-successo) |
| **Eccezioni**        | [Scenario 12.2 – Creazione gateway fallita](#scenario-122--creazione-gateway-fallita) |

### Scenario 12.1 – Creazione gateway con successo

| Scenario 12.1       | Creazione gateway con successo                             |
|:-------------------:|:----------------------------------------------------------:|
| **Precondizione**   | utente  amministratore o operatore autenticato, rete disponibile              |
| **Postcondizione**  | gateway inserito                    |
| **Passi**           |                                                            |
| **Passo 1**         | L’utente richiede la creazione di un nuovo gateway                           |
| **Passo 2**         | Il sistema presenta un form per i dati necessari |
| **Passo 3**         | L’utente compila correttamente                             |
| **Passo 4**         | Il sistema valida i dati                      |
| **Passo 5**         | Il sistema registra il gateway                             |
| **Passo 6**         | Il sistema conferma l’esito                                |

### Scenario 12.2 – Creazione gateway fallita

| Scenario 12.2       | Creazione gateway fallita                               |
|:-------------------:|:-------------------------------------------------------:|
| **Precondizione**   | utente  amministratore o operatore autenticato                             |
| **Postcondizione**  | nessun gateway creato, compare un messaggio d’errore   |
| **Passi**           |                                                        |
| **Passo 1**         | L’utente richiede la creazione di un nuovo gateway                           |
| **Passo 2**         | Il sistema presenta un form per i dati necessari |
| **Passo 3**         | L’utente compila in modo errato      |
| **Passo 4**         | Il sistema rileva l’errore                              |
| **Passo 5**         | Il sistema avvisa e annulla la creazione               |

---

## Use Case 13 – Modificare Gateway

| **Attori Coinvolti** |  utente amministratore o operatore, Sistema                         |
|:--------------------:|:----------------------------------------------:|
| **Precondizione**    | utente  amministratore o operatore autenticato; gateway esistente  |
| **Postcondizione**   | il gateway è aggiornato                        |
| **Scenario Nominale** | [Scenario 13.1 – Modifica gateway con successo](#scenario-131--modifica-gateway-con-successo) |
| **Eccezioni**        | [Scenario 13.2 – Modifica gateway fallita](#scenario-132--modifica-gateway-fallita) |

### Scenario 13.1 – Modifica gateway con successo

| Scenario 13.1       | Modifica gateway con successo                         |
|:-------------------:|:-----------------------------------------------------:|
| **Precondizione**   | utente  amministratore o operatore autenticato, gateway esistente         |
| **Postcondizione**  | i dati del gateway risultano aggiornati              |
| **Passi**           |                                                       |
| **Passo 1**         | L’utente richiede di modificare un gateway          |
| **Passo 2**         | Il sistema mostra i dati correnti                     |
| **Passo 3**         | L’utente modifica i campi desiderati  |
| **Passo 4**         | Il sistema valida i nuovi dati                        |
| **Passo 5**         | Il sistema registra la modifica                       |
| **Passo 6**         | Il sistema conferma l’avvenuto aggiornamento         |

### Scenario 13.2 – Modifica gateway fallita

| Scenario 13.2       | Modifica gateway fallita                                 |
|:-------------------:|:--------------------------------------------------------:|
| **Precondizione**   | utente  amministratore o operatore autenticato                               |
| **Postcondizione**  | il gateway resta invariato; errore segnalato            |
| **Passi**           |                                                          |
| **Passo 1**         | L’utente richiede di modificare un gateway          |
| **Passo 2**         | L’utente inserisce dati invalidi      |
| **Passo 3**         | Il sistema rileva l’errore                               |
| **Passo 4**         | Il sistema avvisa e annulla la modifica                  |

---

## Use Case 14 – Eliminare Gateway

| **Attori Coinvolti** |  utente amministratore o operatore, Sistema                                   |
|:--------------------:|:-------------------------------------------------------: |
| **Precondizione**    | utente  amministratore o operatore autenticato; gateway esistente            |
| **Postcondizione**   | gateway eliminato dal sistema                            |
| **Scenario Nominale** | [Scenario 14.1 – Eliminazione gateway con successo](#scenario-141--eliminazione-gateway-con-successo) |
| **Eccezioni**        | [Scenario 14.2 – Eliminazione gateway fallita](#scenario-142--eliminazione-gateway-fallita) |

### Scenario 14.1 – Eliminazione gateway con successo

| Scenario 14.1       | Eliminazione gateway con successo                            |
|:-------------------:|:------------------------------------------------------------:|
| **Precondizione**   | utente  amministratore o operatore autenticato, gateway esistente               |
| **Postcondizione**  | il gateway risulta rimosso                                  |
| **Passi**           |                                                             |
| **Passo 1**         | L’utente richiede di eliminare un gateway                     |
| **Passo 2**         | Il sistema chiede conferma                                  |
| **Passo 3**         | L’utente conferma                                          |
| **Passo 4**         | Il sistema cancella il gateway e conferma                   |

### Scenario 14.2 – Eliminazione gateway fallita

| Scenario 14.2       | Eliminazione gateway fallita                               |
|:-------------------:|:----------------------------------------------------------:|
| **Precondizione**   | utente  amministratore o operatore autenticato                                 |
| **Postcondizione**  | il gateway resta nel sistema, appare un errore            |
| **Passi**           |                                                            |
| **Passo 1**         | L’utente richiede di eliminare un gateway                     |
| **Passo 2**         | Il sistema chiede conferma                                 |
| **Passo 3**         | L’utente conferma                                         |
| **Passo 4**         | Il sistema rileva un impedimento|
| **Passo 5**         | Il sistema annulla l’eliminazione e notifica l’errore     |

---

## Use Case 15 – Visualizzare Lista Gateway

| **Attori Coinvolti** |  utente amministratore o operatore, Sistema                            |
|:--------------------:|:-------------------------------------------------:|
| **Precondizione**    | utente  amministratore o operatore autenticato                        |
| **Postcondizione**   | viene mostrato l’elenco di tutti i gateway (es. di una rete) |
| **Scenario Nominale** | [Scenario 15.1 – Visualizzazione lista gateway con successo](#scenario-151--visualizzazione-lista-gateway-con-successo) |
| **Eccezioni**        | [Scenario 15.2 – Errore visualizzazione lista gateway](#scenario-152--errore-visualizzazione-lista-gateway) |

### Scenario 15.1 – Visualizzazione lista gateway con successo

| Scenario 15.1       | Visualizzazione lista gateway con successo                |
|:-------------------:|:---------------------------------------------------------:|
| **Precondizione**   | utente  amministratore o operatore autenticato                                |
| **Postcondizione**  | i gateway presenti sono elencati                          |
| **Passi**           |                                                           |
| **Passo 1**         | L’utente richiede la lista gateway                        |
| **Passo 2**         | Il sistema mostra l’elenco                                |

### Scenario 15.2 – Errore visualizzazione lista gateway

| Scenario 15.2       | Errore visualizzazione lista gateway                         |
|:-------------------:|:-----------------------------------------------------------:|
| **Precondizione**   | utente  amministratore o operatore autenticato                                  |
| **Postcondizione**  | la lista non appare; il sistema mostra un messaggio d’errore |
| **Passi**           |                                                              |
| **Passo 1**         | L’utente richiede la lista gateway                           |
| **Passo 2**         | Si verifica un errore nel recupero dei dati  |
| **Passo 3**         | Il sistema notifica l’errore                                 |

---

## Use Case 16 – Visualizzare Dettaglio Gateway

| **Attori Coinvolti** |  utente amministratore o operatore, Sistema                               |
|:--------------------:|:----------------------------------------------------:|
| **Precondizione**    | utente  amministratore o operatore autenticato, gateway esistente        |
| **Postcondizione**   | vengono mostrati i dettagli del gateway selezionato  |
| **Scenario Nominale** | [Scenario 16.1 – Visualizzazione dettaglio gateway con successo](#scenario-161--visualizzazione-dettaglio-gateway-con-successo) |
| **Eccezioni**        | [Scenario 16.2 – Errore visualizzazione dettaglio gateway](#scenario-162--errore-visualizzazione-dettaglio-gateway) |

### Scenario 16.1 – Visualizzazione dettaglio gateway con successo

| Scenario 16.1       | Visualizzazione dettaglio gateway con successo             |
|:-------------------:|:----------------------------------------------------------:|
| **Precondizione**   | utente  amministratore o operatore autenticato, gateway esistente             |
| **Postcondizione**   | vengono mostrati i dettagli del gateway selezionato  |
| **Passi**           |                                                            |
| **Passo 1**         | L’utente seleziona il gateway desiderato                   |
| **Passo 2**         | Il sistema visualizza i dettagli                           |

### Scenario 16.2 – Errore visualizzazione dettaglio gateway

| Scenario 16.2       | Errore visualizzazione dettaglio gateway             |
|:-------------------:|:----------------------------------------------------:|
| **Precondizione**   | utente  amministratore o operatore autenticato                           |
| **Postcondizione**  | nessun dettaglio mostrato, appare errore            |
| **Passi**           |                                                      |
| **Passo 1**         | L’utente seleziona il gateway                        |
| **Passo 2**         | Gateway inesistente o DB offline                     |
| **Passo 3**         | Il sistema notifica l’errore                         |

---

## Use Case 17 – Creare Sensore

| **Attori Coinvolti** |  utente amministratore o operatore, Sistema                                     |
|:--------------------:|:----------------------------------------------------------:|
| **Precondizione**   | utente  amministratore o operatore autenticato, gateway esistente            |
| **Postcondizione**   | il nuovo sensore risulta creato                            |
| **Scenario Nominale** | [Scenario 17.1 – Creazione sensore con successo](#scenario-171--creazione-sensore-con-successo) |
| **Eccezioni**        | [Scenario 17.2 – Creazione sensore fallita](#scenario-172--creazione-sensore-fallita) |

### Scenario 17.1 – Creazione sensore con successo

| Scenario 17.1       | Creazione sensore con successo                           |
|:-------------------:|:--------------------------------------------------------:|
| **Precondizione**   | utente  amministratore o operatore autenticato, gateway esistente            |
| **Postcondizione**   | il nuovo sensore risulta creato                            |
| **Passi**           |                                                          |
| **Passo 1**         | L’utente richiede creazione sensore                      |
| **Passo 2**         | Il sistema mostra il form  |
| **Passo 3**         | L’utente compila correttamente                           |
| **Passo 4**         | Il sistema valida e registra il sensore                  |
| **Passo 5**         | Il sistema conferma l’esito positivo                     |

### Scenario 17.2 – Creazione sensore fallita

| Scenario 17.2       | Creazione sensore fallita                                 |
|:-------------------:|:---------------------------------------------------------:|
| **Precondizione**   | utente  amministratore o operatore autenticato                               |
| **Postcondizione**  | nessun sensore creato, compare un errore                 |
| **Passi**           |                                                          |
| **Passo 1**         | L’utente richiede creazione sensore                      |
| **Passo 2**         | L’utente inserisce dati duplicati o incompleti           |
| **Passo 3**         | Il sistema rileva l’errore                               |
| **Passo 4**         | Il sistema avvisa e annulla la creazione                 |

---

## Use Case 18 – Modificare Sensore

| **Attori Coinvolti** |  utente amministratore o operatore, Sistema                          |
|:--------------------:|:-----------------------------------------------:|
| **Precondizione**    | utente  amministratore o operatore autenticato; sensore esistente   |
| **Postcondizione**   | i dati del sensore risultano aggiornati         |
| **Scenario Nominale** | [Scenario 18.1 – Modifica sensore con successo](#scenario-181--modifica-sensore-con-successo) |
| **Eccezioni**        | [Scenario 18.2 – Modifica sensore fallita](#scenario-182--modifica-sensore-fallita) |

### Scenario 18.1 – Modifica sensore con successo

| Scenario 18.1       | Modifica sensore con successo                     |
|:-------------------:|:-------------------------------------------------:|
| **Precondizione**   | utente  amministratore o operatore autenticato, sensore esistente     |
| **Postcondizione**   | i dati del sensore risultano aggiornati         |
| **Passi**           |                                                   |
| **Passo 1**         | L’utente richiede di modificare un sensore       |
| **Passo 2**         | Il sistema mostra i dati correnti                 |
| **Passo 3**         | L’utente modifica i campi                         |
| **Passo 4**         | Il sistema valida i nuovi dati                    |
| **Passo 5**         | Il sistema registra la modifica                   |
| **Passo 6**         | Il sistema conferma l’operazione                  |

### Scenario 18.2 – Modifica sensore fallita

| Scenario 18.2       | Modifica sensore fallita                               |
|:-------------------:|:------------------------------------------------------:|
| **Precondizione**   | utente  amministratore o operatore autenticato                             |
| **Postcondizione**  | il sensore resta invariato, appare errore             |
| **Passi**           |                                                       |
| **Passo 1**         | L’utente richiede di modificare un sensore       |
| **Passo 2**         | Il sistema mostra i dati correnti                 |
| **Passo 3**         | L’utente inserisce dati non validi                    |
| **Passo 4**         | Il sistema segnala l’errore                           |
| **Passo 5**         | Il sistema annulla la modifica                        |

---

## Use Case 19 – Eliminare Sensore

| **Attori Coinvolti** |  utente amministratore o operatore, Sistema                                    |
|:--------------------:|:--------------------------------------------------------: |
| **Precondizione**    | utente  amministratore o operatore autenticato; sensore esistente            |
| **Postcondizione**   | il sensore risulta rimosso dal sistema                   |
| **Scenario Nominale** | [Scenario 19.1 – Eliminazione sensore con successo](#scenario-191--eliminazione-sensore-con-successo) |
| **Eccezioni**        | [Scenario 19.2 – Eliminazione sensore fallita](#scenario-192--eliminazione-sensore-fallita) |

### Scenario 19.1 – Eliminazione sensore con successo

| Scenario 19.1       | Eliminazione sensore con successo                      |
|:-------------------:|:------------------------------------------------------:|
| **Precondizione**   | utente  amministratore o operatore autenticato, sensore esistente         |
| **Postcondizione**  | il sensore risulta eliminato                          |
| **Passi**           |                                                       |
| **Passo 1**         | L’utente richiede di eliminare un sensore           |
| **Passo 2**         | Il sistema chiede conferma                             |
| **Passo 3**         | L’utente conferma                                     |
| **Passo 4**         | Il sistema rimuove il sensore e notifica l’esito positivo |

### Scenario 19.2 – Eliminazione sensore fallita

| Scenario 19.2       | Eliminazione sensore fallita                              |
|:-------------------:|:---------------------------------------------------------:|
| **Precondizione**   | utente  amministratore o operatore autenticato                                |
| **Postcondizione**  | il sensore resta presente, appare errore                 |
| **Passi**           |                                                           |
| **Passo 1**         | L’utente richiede di eliminare un sensore           |
| **Passo 2**         | Il sistema chiede conferma                                |
| **Passo 3**         | L’utente conferma                                        |
| **Passo 4**         | Un vincolo impedisce l’eliminazione  |
| **Passo 5**         | Il sistema avvisa e annulla l’operazione                 |

---

## Use Case 20 – Visualizzare Lista Sensori

| **Attori Coinvolti** |  utente amministratore o operatore, Sistema                            |
|:--------------------:|:-------------------------------------------------:|
| **Precondizione**    | utente  amministratore o operatore autenticato                        |
| **Postcondizione**   | viene mostrata la lista dei sensori  |
| **Scenario Nominale** | [Scenario 20.1 – Visualizzazione lista sensori con successo](#scenario-201--visualizzazione-lista-sensori-con-successo) |
| **Eccezioni**        | [Scenario 20.2 – Errore visualizzazione lista sensori](#scenario-202--errore-visualizzazione-lista-sensori) |

### Scenario 20.1 – Visualizzazione lista sensori con successo

| Scenario 20.1       | Visualizzazione lista sensori con successo                |
|:-------------------:|:---------------------------------------------------------:|
| **Precondizione**   | utente  amministratore o operatore autenticato                                |
| **Postcondizione**   | viene mostrata la lista dei sensori  |
| **Passi**           |                                                           |
| **Passo 1**         | L’utente richiede la visualizzazione dei sensori                    |
| **Passo 2**         | Il sistema presenta l’elenco                              |

### Scenario 20.2 – Errore visualizzazione lista sensori

| Scenario 20.2       | Errore visualizzazione lista sensori                        |
|:-------------------:|:-----------------------------------------------------------:|
| **Precondizione**   | utente  amministratore o operatore autenticato                                  |
| **Postcondizione**  | la lista non è mostrata, appare un messaggio d’errore       |
| **Passi**           |                                                             |
| **Passo 1**         | L’utente richiede la visualizzazione dei sensori                    |
| **Passo 2**         | Errore nel recupero dei dati  |
| **Passo 3**         | Il sistema notifica l’errore                                 |

---

## Use Case 21 – Visualizzare Dettaglio Sensore

| **Attori Coinvolti** |  utente amministratore o operatore, Sistema                                |
|:--------------------:|:-----------------------------------------------------:|
| **Precondizione**    | utente  amministratore o operatore autenticato, sensore esistente         |
| **Postcondizione**   | i dettagli del sensore selezionato sono visibili      |
| **Scenario Nominale** | [Scenario 21.1 – Visualizzazione dettaglio sensore con successo](#scenario-211--visualizzazione-dettaglio-sensore-con-successo) |
| **Eccezioni**        | [Scenario 21.2 – Errore visualizzazione dettaglio sensore](#scenario-212--errore-visualizzazione-dettaglio-sensore) |

### Scenario 21.1 – Visualizzazione dettaglio sensore con successo

| Scenario 21.1       | Visualizzazione dettaglio sensore con successo           |
|:-------------------:|:--------------------------------------------------------:|
| **Precondizione**   | utente  amministratore o operatore autenticato, sensore esistente           |
| **Postcondizione**   | i dettagli del sensore selezionato sono visibili      |
| **Passi**           |                                                         |
| **Passo 1**         | L’utente seleziona il sensore                           |
| **Passo 2**         | Il sistema mostra i dettagli                            |

### Scenario 21.2 – Errore visualizzazione dettaglio sensore

| Scenario 21.2       | Errore visualizzazione dettaglio sensore                  |
|:-------------------:|:---------------------------------------------------------:|
| **Precondizione**   | utente  amministratore o operatore autenticato                                |
| **Postcondizione**  | nessuna informazione visualizzata, errore mostrato        |
| **Passi**           |                                                           |
| **Passo 1**         | L’utente seleziona il sensore                             |
| **Passo 2**         | errore nel recupero dei dati                          |
| **Passo 3**         | Il sistema notifica l’errore                              |

---

## Use Case 22 – Inserire Misurazioni

| **Attori Coinvolti**  | utente  amministratore o operatore, Sistema                              |
|:---------------------:|:-----------------------------------------------------------------------------:|
| **Precondizione**   | sensore esistente; utente  amministratore o operatore autenticato        |
| **Postcondizione**    | le misurazioni sono salvate in formato UTC                                    |
| **Scenario Nominale** | [Scenario 22.1 – Inserimento misurazioni con successo](#scenario-221--inserimento-misurazioni-con-successo) |
| **Eccezioni**         | [Scenario 22.2 – Inserimento misurazioni fallito](#scenario-222--inserimento-misurazioni-fallito)          |

### Scenario 22.1 – Inserimento misurazioni con successo

| Scenario 22.1       | Inserimento misurazioni con successo                             |
|:-------------------:|:----------------------------------------------------------------:|
| **Precondizione**   | sensore esistente; utente  amministratore o operatore autenticato        |
| **Postcondizione**  | valori e timestamp convertiti in UTC e memorizzati               |
| **Passi**           |                                                                   |
| **Passo 1**         | L’utente invia un set di misurazioni |
| **Passo 2**         | Il sistema converte i timestamp in UTC                            |
| **Passo 3**         | Il sistema memorizza i valori                                    |
| **Passo 4**         | Il sistema notifica l’avvenuto inserimento                       |

### Scenario 22.2 – Inserimento misurazioni fallito

| Scenario 22.2       | Inserimento misurazioni fallito                               |
|:-------------------:|:-------------------------------------------------------------:|
| **Precondizione**   | sensore esistente, utente  amministratore o operatore autenticato    |
| **Postcondizione**  | nessuna misurazione salvata; compare un messaggio d’errore    |
| **Passi**           |                                                               |
| **Passo 1**         | L’utente invia misurazioni corrotte o con timestamp errato |
| **Passo 2**         | Il sistema rileva l’errore                                    |
| **Passo 3**         | Il sistema rifiuta i dati e notifica l’errore                |

---

## Use Case 23 – Invio Misurazioni automatico

| **Attori Coinvolti**  | sensore, gateway, Sistema                              |
|:---------------------:|:-----------------------------------------------------------------------------:|
| **Precondizione**   | sensore e gateway esistenti e funzionanti        |
| **Postcondizione**    | le misurazioni sono salvate in formato UTC                                    |
| **Scenario Nominale** | [Scenario 23.1 – Invio misurazioni con successo](#scenario-231--invio-misurazioni-con-successo) |
| **Eccezioni**         | [Scenario 23.2 – Invio misurazioni fallito](#scenario-232--invio-misurazioni-fallito)          |

### Scenario 23.1 – Invio misurazioni con successo

| Scenario 23.1       | Invio misurazioni con successo                             |
|:-------------------:|:----------------------------------------------------------------:|
| **Precondizione**   | sensore e gateway esistenti e funzionanti        |
| **Postcondizione**    | le misurazioni sono salvate in formato UTC                                    |
| **Passi**           |                                                                   |
| **Passo 1**         | Il sensore invia costantemente misurazioni al gateway |
| **Passo 2**         | Il gateway inoltra le misurazioni al Sistema |
| **Passo 3**         | Il sistema converte i timestamp in UTC                            |
| **Passo 4**         | Il sistema memorizza i valori                                    |

### Scenario 23.2 – Invio misurazioni fallito

| Scenario 23.2       | Invio misurazioni fallito                               |
|:-------------------:|:-------------------------------------------------------------:|
| **Precondizione**   | sensore e gateway esistenti e malfunzionanti        |
| **Postcondizione**  | nessuna misurazione salvata; viene loggato un messaggio d’errore    |
| **Passi**           |                                                               |
| **Passo 1**         | Il sensore invia misurazioni corrotte o con timestamp errato al gateway |
| **Passo 2**         | Il gateway inoltra le misurazioni al Sistema |
| **Passo 2**         | Il sistema rileva l’errore                                    |
| **Passo 3**         | Il sistema rifiuta i dati e logga l’errore                |

---

## Use Case 24 – Visualizzare Misurazioni

| **Attori Coinvolti** | utente amministratore, Operatore , Visualizzatore e Sistema                                       |
|:--------------------:|:----------------------------------------------------------------------:|
| **Precondizione**   | L’utente è autenticato       |
| **Postcondizione**   | le misurazioni richieste vengono mostrate all’utente                   |
| **Scenario Nominale** | [Scenario 24.1 – Visualizzazione misurazioni ](#scenario-241--visualizzazione-misurazioni-base) |
| **Eccezioni**        | [Scenario 24.2 – Nessuna misurazione presente](#scenario-242--nessuna-misurazione-presente)           |

### Scenario 24.1 – Visualizzazione misurazioni

| Scenario 24.1       | Visualizzazione misurazioni                           |
|:-------------------:|:------------------------------------------------------:|
| **Precondizione**   | L’utente è autenticato       |
| **Postcondizione**   | le misurazioni richieste vengono mostrate all’utente                   |
| **Passi**           |                                                           |
| **Passo 1**         | L’utente richiede la visualizzazione delle misurazioni|
| **Passo 2**         | Il sistema mostra un form per inserire i filtri                                  |
| **Passo 3**         | L'utente compila il form                    |
| **Passo 3**         | Il sistema mostra i risultati filtrati                    |


### Scenario 24.3 – Nessuna misurazione presente

| Scenario 24.3       | Nessuna misurazione presente                                  |
|:-------------------:|:------------------------------------------------------------:|
| **Precondizione**   | L’utente è autenticato                                       |
| **Postcondizione**  | nessun dato mostrato, appare un messaggio adeguato      |
| **Passi**           |                                                              |
| **Passo 1**         | L’utente richiede la visualizzazione di misurazioni          |
| **Passo 2**         | Il sistema mostra un form per inserire i filtri                                  |
| **Passo 3**         | L'utente compila il form                    |
| **Passo 4**         | Il sistema non mostra nessuna misurazione dato che non ce ne sono                 |



---

## Use Case 25 – Calcolo Statistiche

| **Attori Coinvolti** |  utente amministratore o operatore, Sistema                                         |
|:--------------------:|:--------------------------------------------------------------:|
| **Precondizione**   | utente  amministratore o operatore autenticato; esistono misurazioni          |
| **Postcondizione**   | il sistema calcola i valori statistici e le soglie di outlier |
| **Scenario Nominale** | [Scenario 25.1 – Calcolo statistico ](#scenario-251--calcolo-statistico) |
| **Eccezioni**        | [Scenario 25.2 – Nessuna misurazione disponibile](#scenario-252--nessuna-misurazione-disponibile) |

### Scenario 25.1 – Calcolo statistico

| Scenario 25.1       | Calcolo statistico          |
|:-------------------:|:----------------------------------------------------------:|
| **Precondizione**   | utente  amministratore o operatore autenticato; esistono misurazioni          |
| **Postcondizione**   | il sistema calcola i valori statistici e le soglie di outlier |
| **Passi**           |                                                            |
| **Passo 1**         | L’utente richiede il calcolo delle statistiche su un set di sensori |
| **Passo 2**         | Il sistema calcola e restituisce le misurazioni e le memorizza                   |


### Scenario 25.2 – Nessuna misurazione disponibile

| Scenario 25.2       | Nessuna misurazione disponibile                 |
|:-------------------:|:-----------------------------------------------------------:|
| **Precondizione**   | utente  amministratore o operatore autenticato    |
| **Postcondizione**  | il sistema non calcola nulla; messaggio di errore/avviso    |
| **Passi**           |                                                             |
| **Passo 1**         | L’utente richiede il calcolo delle statistiche su un set di sensori |
| **Passo 2**         | Il sistema non trova misurazioni o dati validi              |
| **Passo 3**         | Il sistema notifica che nessuna statistica è stata calcolata        |

---

## Use Case 26 – Visualizzare Statistiche

| **Attori Coinvolti** | utente amministratore, Operatore , Visualizzatore e Sistema                                       |
|:--------------------:|:------------------------------------------------------------------------:|
| **Precondizione**    | utente autenticato, esistono statistiche già calcolate     |
| **Postcondizione**   | l’utente visualizza le statistiche                     |
| **Scenario Nominale** | [Scenario 26.1 – Visualizzazione statistiche ](#scenario-261--visualizzazione-statistiche) |
| **Eccezioni**        | [Scenario 26.2 – Nessuna statistica disponibile](#scenario-262--nessuna-statistica-disponibile)                  |

### Scenario 26.1 – Visualizzazione statistiche

| Scenario 26.1       | Visualizzazione statistiche                                 |
|:-------------------:|:-----------------------------------------------------------:|
| **Precondizione**    | utente autenticato, esistono statistiche già calcolate     |
| **Postcondizione**   | l’utente visualizza le statistiche                     |
| **Passi**           |                                                             |
| **Passo 1**         | L’utente richiede la visualizzazione delle statistiche                 |
| **Passo 2**         | Il sistema mostra un form per inserire i filtri                                  |
| **Passo 3**         | L'utente compila il form                    |
| **Passo 4**         | Il sistema mostra le statistiche richieste                 |

### Scenario 26.2 – Nessuna statistica disponibile

| Scenario 26.1       | Visualizzazione statistiche                                 |
|:-------------------:|:-----------------------------------------------------------:|
| **Precondizione**    | utente autenticato     |
| **Postcondizione**   | nessuna statistica viene visualizzata e viene notificata l'assenza di statistiche                     |
| **Passi**           |                                                             |
| **Passo 1**         | L’utente richiede la visualizzazione delle statistiche                 |
| **Passo 2**         | Il sistema mostra un form per inserire i filtri                                  |
| **Passo 3**         | L'utente compila il form                    |
| **Passo 4**         | nessuna statistica viene visualizzata, dato che non ci sono statistiche calcolate e viene notificata l'assenza di statistiche                  |


# Glossary

\<use UML class diagram to define important terms, or concepts in the domain of the application, and their relationships>

\<concepts must be used consistently all over the document, ex in use cases, requirements etc>

# System Design

\<describe here system design>

\<must be consistent with Context diagram>

# Deployment Diagram

\<describe here deployment diagram >
