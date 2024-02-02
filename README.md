# Introduction
This is the repository for the browser-based online game "Sky Duel". The in-development name of the project is 'Bloxu' which is why the repository is named correspondingly. This readme file serves as the main documentation of the game, its project structure and its architecture.

## How to Play the Game
You can play the game at: https://joonashalinen.net. The game is a two-player shooting game where the goal is to defeat your opponent. You can defeat your opponent by either making them fall from the map or by shooting them.

> [!WARNING]  
> If you are intending on testing the game by playing against yourself then please remember to ensure both games are visible. You can do this by creating two browser windows instead of tabs. Due to browser optimizations, running the game on a hidden tab will freeze it. This will then cause synchronization issues.

<img styles="margin:auto" src="docs/promo_images/shooting.png" width="250">

*Image 1, player shooting*

Additionally, you can also build by placing blocks in the world. These blocks can serve as platforms for you to walk on. Alternatively, you can use these blocks to shield yourself from your opponent's bullets.

<img styles="margin:auto" src="docs/promo_images/building.png" width="250">

*Image 2, placing a block on the lower-left corner (cursor not visible)*

<br />
<img styles="margin:auto" src="docs/promo_images/building_down.png" width="250">

*Image 3, placing a block lower (holding shift)*

<br />
<img styles="margin:auto" src="docs/promo_images/building_up.png" width="250">

*Image 4, placing a block higher (holding space)*

### Hosting a New Game
To start playing, you must either host a new game or join an existing one. If you wish to host a new game, you can press the "Host Game" button on the title menu. After you have hosted a new game, you will receive a game code, which you can tell your friend so they can join the same game with you. After your friend has joined, the game will begin.

### Joining a Game
To join a game, you need the host of the game to tell you their game code. Once you know the game code, you can join a game by pressing the "Join Game" button on the title menu. Doing so will prompt you to enter your game code. Once you have entered a valid game code, the game will begin.

### Controls
| Button  | Description |
| ------------- | ------------- |
| Left mouse button  | Shoot (if in battle mode) / Place block (if in build mode)  |
| W / A / S / D  | Move forward / left / backwards / right  |
| Q  | Toggle between battle mode and build mode  |
| Space  | Jump (if in battle mode) / Move block placement menu higher (if in build mode) |
| Shift  | Move block placement menu lower (if in build mode) |

# Central Third Party Libraries
The project uses some third-party libraries. The most central of them is BabylonJS, which is the game engine the project uses. In addition, ExpressJS as well as WebSockets via the 'ws' library are used in the online server. Finally, webpack is used to bundle the final source code that is run on the browser.

# Project Folder Structure
The following is a list of the most important files and folders as well as their descriptions:

* src/: Contains all the source code of the project.

* src/components/: Contains all reusable classes of the project. The classes are categorized into subfolders based on the subject area of the classes. Each subfolder is thought of as a reusable class library fit for some specific problem domain. To facilitate modularity, circular dependencies between libraries is not allowed. Each library subfolder contains two subfolders: 'prv' and 'pub'. The former contains all classes that are deemed private for that library and the latter those that are public (i.e. for use outside the library).

* src/services/: Contains the project-specific (i.e. non-reusable) code for each service of the project (see 'Service Architecture' below).

* src/browser/: Contains files and folders only relevant for the browser-side instance of the game (as opposed to the online server that facilitates online play).

* src/browser/app.ts: The main program that runs the browser-side instance of the game.

* src/server/: Contains the files and folders only relevant for the online server of the game. The online server runs perpetually on the cloud and facilitates online play.

* src/server/dist/index.ts: The main program that runs the online server.

# Service Architecture

The project has a conceptual service architecture. The following diagram shows each service as well as their relationships to another.

<img styles="margin:auto" src="docs/service_architecture.png" width="600">

*Image 5, service architecture*

A solid arrow from a service to another in the diagram denotes a "knows of" relationship. If a service knows of another service, then it most likely has a dependency relationship to it. Knowing about another service means that the service is expected to a) exist and b) send or receive the expected messages. To promote modularity, circular dependencies between services are not allowed.

A dashed arrow indicates an implementation inheritance relationship. The target of the arrow is then not a concrete service but an interface. The source of the arrow then implements that interface.

As discussed above, each service is able to send messages to other services. In addition, they can send public messages that are not sent to any specific service. Instead, all services receive these types of messages and can choose for themselves if they wish to care about the received message or not.

## Individual Service Responsibilities

The following is a description of the individual responsibilities of each service:
* **3D World:** This service is responsible for running the game engine. It provides access points for the other services so that they can interact with the objects in the world.

* **IO:** The IO Service is responsible for capturing user controls, such as keyboard and mouse events for example. The IO Service sends public messages when the user controls change. The IO Service adds a layer of abstraction that can make it possible to decouple the game from the user controls. This can be useful in the future if support for different types of controllers is added, such as for joystick controllers for example.

* **LocalPlayer:** The LocalPlayer service is the glue between the local player character's objects in the 3D world and the real user controlling the player. Most importantly, it is responsible for connecting user controls to the player character in the 3D world.

* **RemotePlayer:** A RemotePlayer service is instantiated for the opponent. RemotePlayer connects the real human playing as the opponent to the corresponding player character in the 3D world.

* **Player:** The Player interface describes the common interface between LocalPlayer and RemotePlayer. Conceptually, a 'Player' is the intelligence behind a player character in the game. The intelligence may be an actual human controlling the player via a controller or it may be an AI. Currently AI players have not been implemented but this is a plausible future development path.

* **Online Synchronizer:** This service is responsible for ensuring that the two remote separate game instances stay synchronized (i.e. that they 'agree' about the state of the world).

* **GameMaster:** The GameMaster service controls all universal game logic. 'Game logic' means any behaviour that is exclusively part of the idea of a 1v1 shooting game such as Sky Duel. For example, collision physics is not game logic because it is behaviour that applies to many kinds of 3D simulations instead of just the Sky Duel game. Conversely, deciding that the game has ended because one of the players has died is part of game logic.

* **UI:** The UI service is responsible for managing all GUI behaviour.

## Service Folder Locations

The locations of each service in the project folder structure are as follows:
| Service  | Folder Path |
| ------------- | ------------- |
| 3D World  | src/services/world3d |
| IO  | src/services/io |
| LocalPlayer  | src/services/player/pub/local |
| RemotePlayer  | src/services/player/pub/remote |
| Online Synchronizer  | src/services/online_synchronizer |
| Game Master  | src/services/game_master |
| UI  | src/services/ui |

# Concrete Process Architecture

The previous description of the project's service architecture was a description of the conceptual service architecture. Conversely, this section describes what the real-world processes are and which services they run. In the context of the browser client, a process is a web worker. In the context of the online server, a process is an operating system process. The following image depicts the individual processes and their relationships to one another.

<img styles="margin:auto" src="docs/process_architecture.png" width="600">

*Image 6, process architecture*

As in the diagram of the service architecture, a solid arrow indicates a "knows of" relationship. Similarly, a dashed arrow indicates an implementation inheritance relationship. The difference between this diagram and the conceptual service architecture diagram is that some services are joined into the same process. Additionally, the "Online Synchronizer" service is split into two separate processes: one running on the browser and one running on the online server.