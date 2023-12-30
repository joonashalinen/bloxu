import { DMessage } from "../../messaging/pub/DMessage";
import MessageFactory from "../../messaging/pub/MessageFactory";
import ProxyMessenger from "../../messaging/pub/ProxyMessenger";
import SyncMessenger from "../../messaging/pub/SyncMessenger";

/**
 * Common interface for all service classes.
 * A service class is a class containing 
 * the operations and state of a service / actor / microservice.
 */
export default interface IService {
    proxyMessenger: ProxyMessenger<DMessage, DMessage>;
    syncMessenger: SyncMessenger;
    messageFactory: MessageFactory;
    
    /**
     * Initialize the service. After calling this it is ready for use.
     */
    initialize(): Promise<boolean>;
}