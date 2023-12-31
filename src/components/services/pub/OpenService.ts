import DataObject from "../../data_structures/pub/DataObject";
import FunctionWrapper from "./FunctionWrapper";
import IService from "./IService";

/**
 * A service that is completely open to custom 
 * modification by outsiders.
 */
export default class OpenService {
    constructor(public service: IService) {
        
    }

    /**
     * Modify the class with a given function
     * that is allowed to do anything to the class.
     */
    modify(modifier: FunctionWrapper<(self: IService, ...args: unknown[]) => void>) {
        return modifier.f.bind(this)(...modifier.boundArgs);
    }

    /**
     * Listen to an event via a given function. 
     * The given function 'listener' is given a function 'sendMsg', which 
     * 'listener' can call when it wants to send back an event message 
     * to the listening service.
     */
    listen(
        listeningService: string, 
        listener: FunctionWrapper<(sendMsg: (eventName: string, event: DataObject) => void, ...args: unknown[]) => void>
    ) {
        const sendMsg = (eventName: string, event: DataObject) => this.service.proxyMessenger.postMessage(
            this.service.messageFactory.createEvent(listeningService, eventName, [event])
        );
        listener.f.bind(this)(sendMsg, ...listener.boundArgs);
    }
}