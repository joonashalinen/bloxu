import { DMessage } from "../../messaging/pub/DMessage";
import MessageFactory from "../../messaging/pub/MessageFactory";
import SyncMessenger from "../../messaging/pub/SyncMessenger";
import IMessenger from "./IMessenger";

/**
 * Provides a more clean and convenient interface for 
 * dealing with messaging to/from a specific destination.
 */
export default class Channel {
    syncMessenger: SyncMessenger;
    messageFactory: MessageFactory;

    constructor(
        public clientId: string,
        public targetId: string,
        public messenger: IMessenger<DMessage, DMessage>
    ) {
        this.syncMessenger = new SyncMessenger(this.messenger);
        this.messageFactory = new MessageFactory(clientId);
    }

    /**
     * Sends a request message to the target.
     * Returns a promise that is fulfilled with the response of the target.
     */
    async request(method: string, args: unknown[]) {
        return await (this.syncMessenger.postSyncMessage(
            this.messageFactory.createRequest(this.targetId, method, args)
        ));
    }

    /**
     * Sends an event message to the target.
     */
    sendEvent(eventName: string, args: unknown[]) {
        this.messenger.postMessage(
            this.messageFactory.createEvent(this.targetId, eventName, args)
        );
    }
}