import DVector3 from "../../../components/graphics3d/pub/DVector3";
import World3D from "../../world3d/pub/World3D";
import Creature from "./Creature";
import DPlayerBody from "../../world3d/conf/custom_object_types/DPlayerBody";
import IService from "../../../components/services/pub/IService";
import { DMessage } from "../../../components/messaging/pub/DMessage";
import MessageFactory from "../../../components/messaging/pub/MessageFactory";
import ProxyMessenger from "../../../components/messaging/pub/ProxyMessenger";
import SyncMessenger from "../../../components/messaging/pub/SyncMessenger";

/**
 * A Creature that is controlled remotely by another online creature.
 */
export default class RemoteCreature implements IService {
    creature: Creature;
    eventHandlers: {[name: string]: Function};
    proxyMessenger: ProxyMessenger<DMessage, DMessage>;
    syncMessenger: SyncMessenger;
    messageFactory: MessageFactory;

    constructor(id: string, bodyId: string) {
        this.creature = new Creature(id, bodyId);
        this.creature.controlsDisabled = true;
        this.creature.disableEvents = true;
        this.proxyMessenger = this.creature.proxyMessenger;
        this.syncMessenger = this.creature.syncMessenger;
        this.messageFactory = this.creature.messageFactory;

        this.eventHandlers = {};
    }
    
    /**
     * Initialize RemoteCreature service.
     */
    async initialize() {
        return this.creature.initialize();
    }

    spawn(startingPosition: DVector3) {
        return this.creature.spawn(startingPosition);
    }
}