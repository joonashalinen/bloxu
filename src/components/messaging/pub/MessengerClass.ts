import IMessenger from "./IMessenger";
import {DMessage, DMessageData} from "./DMessage";
import EventEmitter from "../../events/pub/EventEmitter";

/**
 * A wrapper for a given class that implements IMessenger
 * by simply calling the class's methods and using an EventEmitter. 
 * The EventEmitter is assumed to be such that the wrappee class 
 * has access to it and can thus use it to trigger message events.
 */
export default class MessagerClass<C> implements IMessenger<DMessage, unknown> {
    wrappee: C;
    wrappeeEmitter: EventEmitter;
    messageEvent: string;

    constructor(wrappee: C, wrappeeEmitter: EventEmitter, messageEvent: string = "message") {
        this.wrappee = wrappee;
        this.wrappeeEmitter = wrappeeEmitter;
        this.messageEvent = messageEvent;
    }

    postMessage(msg: DMessage): IMessenger<DMessage, unknown> {
        if (
            msg.type === "request" && 
            typeof this.wrappee === "object" && 
            msg.message.type in this.wrappee
        ) {
            this.wrappee[msg.message.type](...msg.message.args);
        }
        if (msg.type === "event") {
            if (
                typeof this.wrappee === "object" && 
                "eventHandlers" in this.wrappee && 
                typeof this.wrappee.eventHandlers === "object" && 
                msg.message.type in this.wrappee.eventHandlers
            ) {
                this.wrappee.eventHandlers[msg.message.type](...msg.message.args)
            }
        }
        return this;
    }

    onMessage(handler: (msg: unknown) => void): IMessenger<DMessage, unknown> {
        this.wrappeeEmitter.on(this.messageEvent, handler);
        return this;
    }
}