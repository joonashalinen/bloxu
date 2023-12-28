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

class App {

    mediator: Mediator;

    /**
     * Call 'initialize' on the given service.
     */
    initializeService(messenger: IMessenger<DMessage, DMessage>, id: string) {
        messenger.postMessage({
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
        var world3d = new World3D(document);
        
        // Create IOService.
        var ioService = new IOService(new KeyboardController(document));

        // Create UI service.
        var ui = new UI(document);

        // Create LocalPlayer service.
        var localPlayerNativeWorker = new Worker(new URL('../services/player/pub/local/index.ts', import.meta.url))
        var localPlayerWorker = new WebWorker(localPlayerNativeWorker);

        // Create RemotePlayer service.
        var remotePlayerNativeWorker = new Worker(new URL('../services/player/pub/remote/index.ts', import.meta.url))
        var remotePlayerWorker = new WebWorker(remotePlayerNativeWorker);

        // Create GameMaster service.
        var gameMasterNativeWorker = new Worker(new URL('../services/game_master/pub/index.ts', import.meta.url))
        var gameMasterWorker = new WebWorker(gameMasterNativeWorker);

        // Create OnlineSynchronizer service.
        var onlineSynchronizerNativeWorker = new Worker(new URL('../services/online_synchronizer/pub/client/index.ts', import.meta.url))
        var onlineSynchronizerWorker = new WebWorker(onlineSynchronizerNativeWorker);

        // Setup communications between services.
        var messengers = {
            "ui": new MessengerClass(ui, ui.proxyMessenger, "ui"),
            "world3d": new MessengerClass(world3d, world3d.proxyMessenger, "world3d"),
            "player-1": localPlayerWorker,
            "player-2": remotePlayerWorker,
            "gameMaster": gameMasterWorker,
            "ioService": new MessengerClass(ioService, ioService.proxyMessenger, "ioService"),
            "onlineSynchronizer": onlineSynchronizerWorker
        };
        this.mediator = new Mediator(messengers);
        
        // Now that we have communications between services, 
        // we can initialize them. World3D must be initialized first, since 
        // other services need it for their initialization procedures.
        await world3d.initialize();
        ioService.initialize();
        this.initializeService(gameMasterWorker, "gameMaster");
        this.initializeService(localPlayerWorker, "player-1");
        this.initializeService(remotePlayerWorker, "player-2");
        this.initializeService(onlineSynchronizerWorker, "onlineSynchronizer");
    }    

    constructor() {
        this.initialize();
    }
}
new App();