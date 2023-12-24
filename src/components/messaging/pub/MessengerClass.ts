import IMessenger from "./IMessenger";
import DClassInMessage from "./DClassInMessage";
import EventEmitter from "../../events/pub/EventEmitter";

/**
 * A wrapper for a given class that implements IMessenger
 * by simply calling the class's methods and using an EventEmitter. 
 * The EventEmitter is assumed to be such that the wrappee class 
 * has access to it and can thus use it to trigger message events.
 */
export default class MessagerClass<C> implements IMessenger<DClassInMessage, unknown> {
    wrappee: C;
    wrappeeEmitter: EventEmitter;
    messageEvent: string;

    constructor(wrappee: C, wrappeeEmitter: EventEmitter, messageEvent: string = "message") {
        this.wrappee = wrappee;
        this.wrappeeEmitter = wrappeeEmitter;
        this.messageEvent = messageEvent;
    }

    postMessage(msg: DClassInMessage): IMessenger<DClassInMessage, unknown> {
        this.wrappee[msg.method](...msg.args);
        return this;
    }

    onMessage(handler: (msg: unknown) => void): IMessenger<DClassInMessage, unknown> {
        this.wrappeeEmitter.on(this.messageEvent, handler);
        return this;
    }
}