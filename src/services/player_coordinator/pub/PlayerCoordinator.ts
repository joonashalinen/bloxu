import { DMessage } from "../../../components/messaging/pub/DMessage";
import ProxyMessenger from "../../../components/messaging/pub/ProxyMessenger";
import SyncMessenger from "../../../components/messaging/pub/SyncMessenger";
import MessageFactory from "../../../components/messaging/pub/MessageFactory";

/**
 * Class that contains the operations and state 
 * of the LocalGameMaster service.
 */
export default class PlayerCoordinator {
    proxyMessenger = new ProxyMessenger<DMessage, DMessage>();
    syncMessenger: SyncMessenger;
    eventHandlers: {[name: string]: Function}
    initialized: boolean;
    messageFactory = new MessageFactory("playerCoordinator");
    selectedPlayer: string = "player-1";
    switchCoolDown = 1000;
    timeAtLastSwitch = 0;
    
    constructor() {
        this.syncMessenger = new SyncMessenger(this.proxyMessenger);
        this.eventHandlers = {
            "IOService:<event>keyUp": this.onControllerKeyUp.bind(this)
        };
        this.initialized = false;
    }

    /**
     * Initialization procedure for the LocalGameMaster service.
     */
    async initialize() {
        this.initialized = true;
        return true;
    }

    /**
     * When a pressed down key has been released on the controller.
     */
    async onControllerKeyUp(key: string, controllerIndex: number) {
        if (controllerIndex !== 0) {return}
        const timeNow = Date.now();

        if (key === "z" && timeNow - this.timeAtLastSwitch > this.switchCoolDown) {
            this.timeAtLastSwitch = timeNow;
            const currentSelectedPlayer = this.selectedPlayer;
            this._switchSelectedPlayer();
            this.proxyMessenger.postMessage(
                this.messageFactory.createRequest(currentSelectedPlayer, "disableControls")
            );
            this.proxyMessenger.postMessage(
                this.messageFactory.createRequest(this.selectedPlayer, "enableControls")
            );
        }
    }

    /**
     * Changes the selected player.
     */
    private _switchSelectedPlayer() {
        this.selectedPlayer = this.selectedPlayer === "player-1" ? "player-2" : "player-1";
    }
}