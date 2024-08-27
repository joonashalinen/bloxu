import { DMessage } from "../../../components/messaging/pub/DMessage";
import ProxyMessenger from "../../../components/messaging/pub/ProxyMessenger";
import SyncMessenger from "../../../components/messaging/pub/SyncMessenger";
import MessageFactory from "../../../components/messaging/pub/MessageFactory";

/**
 * Contains the features of a service that does commonly useful coordination 
 * between creature services. Currenly this coordination is only related
 * to input controls.
 */
export default class CreatureCoordinator {
    proxyMessenger = new ProxyMessenger<DMessage, DMessage>();
    syncMessenger: SyncMessenger;
    eventHandlers: {[name: string]: Function}
    initialized: boolean;
    messageFactory: MessageFactory;
    selectableCreatures: string[] = [];
    selectedCreatureIndex: number;
    changeSelectedCreatureKey: string = "z";
    switchCoolDown = 1000;
    timeAtLastSwitch = 0;
    
    constructor(public id: string) {
        this.messageFactory = new MessageFactory(id);
        this.syncMessenger = new SyncMessenger(this.proxyMessenger);
        this.eventHandlers = {
            "IOService:<event>keyUp": this.onControllerKeyUp.bind(this)
        };
        this.initialized = false;
    }

    /**
     * Initialization procedure for the CreatureCoordinator service.
     */
    async initialize(selectableCreatures: string[], selectedCreatureIndex: number = 0) {
        this.selectableCreatures = selectableCreatures;
        this.selectedCreatureIndex = selectedCreatureIndex;
        this.initialized = true;
        return true;
    }

    /**
     * Returns the name of the creature service that is 
     * currently selected and has input control focus.
     */
    selectedCreature() {
        return this.selectableCreatures[this.selectedCreatureIndex];
    }

    /**
     * When a pressed down key has been released on the controller.
     */
    async onControllerKeyUp(key: string, controllerIndex: number) {
        if (controllerIndex !== 0) {return}
        const timeNow = Date.now();

        if (key === this.changeSelectedCreatureKey && 
            (timeNow - this.timeAtLastSwitch > this.switchCoolDown)) {

            this.timeAtLastSwitch = timeNow;
            const currentSelectedCreature = this.selectedCreature();
            this._carouselSelectedCreature();
            this.proxyMessenger.postMessage(
                this.messageFactory.createRequest(currentSelectedCreature, "disableControls")
            );
            this.proxyMessenger.postMessage(
                this.messageFactory.createRequest(this.selectedCreature(), "enableControls")
            );
        }
    }

    /**
     * Changes the selected player in a carousel rotation.
     */
    private _carouselSelectedCreature() {
        this.selectedCreatureIndex = (this.selectedCreatureIndex ===
            (this.selectableCreatures.length - 1)) ? 0 : this.selectedCreatureIndex + 1;
    }
}