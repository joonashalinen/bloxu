import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import MessengerClass from "../components/messaging/pub/MessengerClass";
import Mediator from "../components/messaging/pub/Mediator";
import World3D from "../services/world3d/pub/World3D";
import WebWorker from "../components/browser/pub/WebWorker";
import IOService from "../services/io/pub/IOService";
import KeyboardController from "../components/controls/pub/KeyboardController";

class App {

    mediator: Mediator;

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

        // Create LocalPlayer service.
        var playerNativeWorker = new Worker(new URL('../services/player/pub/index.ts', import.meta.url))
        var playerWorker = new WebWorker(playerNativeWorker);

        // Create GameMaster service.
        var gameMasterNativeWorker = new Worker(new URL('../services/game_master/pub/index.ts', import.meta.url))
        var gameMasterWorker = new WebWorker(gameMasterNativeWorker);

        // Create OnlineSynchronizer service.
        var onlineSynchronizerNativeWorker = new Worker(new URL('../services/online_synchronizer/pub/client/index.ts', import.meta.url))
        var onlineSynchronizerWorker = new WebWorker(onlineSynchronizerNativeWorker);

        // Setup communications between services.
        var messengers = {
            "world3d": new MessengerClass(world3d, world3d.emitter),
            "player1": playerWorker,
            "gameMaster": gameMasterWorker,
            "ioService": new MessengerClass(ioService, ioService.emitter),
            "onlineSynchronizer": onlineSynchronizerWorker
        };
        this.mediator = new Mediator(messengers);

        // Now that we have communications between services, 
        // we can initialize them. World3D must be initialized first, since 
        // other services need it for their initialization procedures.
        await world3d.initialize();
        ioService.initialize();
        playerWorker.postMessage({
            type: "request",
            message: {
                type: "initialize",
                args: []
            }
        });
        gameMasterWorker.postMessage({
            type: "request",
            message: {
                type: "initialize",
                args: []
            }
        });
    }    

    constructor() {
        this.initialize();
    }
}
new App();