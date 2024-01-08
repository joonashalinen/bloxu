import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import MessengerClass from "../components/messaging/pub/MessengerClass";
import Mediator from "../components/messaging/pub/Mediator";
import World3D from "../services/world3d/pub/World3D";
import WebWorker from "../components/browser/pub/WebWorker";
import IOService from "../services/io/pub/IOService";
import KeyboardController from "../components/controls/pub/KeyboardController";
import IMessenger from "../components/messaging/pub/IMessenger";
import { DMessage } from "../components/messaging/pub/DMessage";
import UI from "../services/ui/pub/UI";
import SyncMessenger from "../components/messaging/pub/SyncMessenger";
import Mixin from "../components/classes/pub/Mixin";
import OpenService from "../components/services/pub/OpenService";
import MouseController from "../components/controls/pub/MouseController";

class App {

    mediator: Mediator;

    /**
     * Call 'initialize' on the given service.
     */
    async initializeService(messenger: IMessenger<DMessage, DMessage>, id: string) {
        await (new SyncMessenger(messenger)).postSyncMessage({
            sender: "-",
            recipient: id,
            type: "request",
            message: {
                type: "initialize",
                args: []
            }
        });
        return this;
    }

    /**
     * The initialization code is separated into 
     * an async function because there are some async 
     * methods we must await.
     */
    async initialize(): Promise<void> {

        // ### Setup services. ###

        // Create World3D service.
        var plainWorld3d = new World3D(document);
        // Allow the World3D service to be freely modifiable by outsiders. 
        // For details, see the class OpenService. 
        // The Mixin class is used to add the .modify and .listen methods to the World3D class.
        var world3d = (new Mixin(plainWorld3d)).extend(
            new OpenService(plainWorld3d)
        ) as (World3D & OpenService);
        
        // Create IOService.
        var ioService = new IOService(
            [new KeyboardController(document)],
            [new MouseController(world3d.canvas)]
        );

        // Create UI service.
        var ui = new UI(document);

        // Create Player 1's service.
        var player1NativeWorker = new Worker(new URL('../services/player/pub/index.ts', import.meta.url), {name: "player-1"})
        var player1Worker = new WebWorker(player1NativeWorker);

        // Create Player 2's service.
        var player2NativeWorker = new Worker(new URL('../services/player/pub/index.ts', import.meta.url), {name: "player-2"})
        var player2Worker = new WebWorker(player2NativeWorker);

        // Create GameMaster service.
        var gameMasterNativeWorker = new Worker(
            new URL('../services/game_master/pub/index.ts', import.meta.url), 
            {name: "gameMaster"}
        )
        var gameMasterWorker = new WebWorker(gameMasterNativeWorker);

        // Create OnlineSynchronizer service.
        var onlineSynchronizerNativeWorker = new Worker(
            new URL('../services/online_synchronizer/pub/client/index.ts', import.meta.url),
            {name: "onlineSynchronizer"}
        )
        var onlineSynchronizerWorker = new WebWorker(onlineSynchronizerNativeWorker);
        
        console.log("initializing services..");
        // Now that we have communications between services, 
        // we can initialize them. World3D must be initialized first, since 
        // other services need it for their initialization procedures.
        await world3d.initialize();
        await ioService.initialize();
        await this.initializeService(gameMasterWorker, "gameMaster");
        await this.initializeService(onlineSynchronizerWorker, "onlineSynchronizer");
        console.log("all services initialized");

        // Setup communications between services.
        var messengers = {
            "ui": new MessengerClass(ui, ui.proxyMessenger, "ui"),
            "world3d": new MessengerClass(world3d, world3d.proxyMessenger, "world3d"),
            "player-1": player1Worker,
            "player-2": player2Worker,
            "gameMaster": gameMasterWorker,
            "ioService": new MessengerClass(ioService, ioService.proxyMessenger, "ioService"),
            "onlineSynchronizer": onlineSynchronizerWorker
        };
        this.mediator = new Mediator(messengers);
    }    

    constructor() {
        // Set name of main worker for debugging.
        self.name = "main";
        this.initialize();
    }
}
new App();