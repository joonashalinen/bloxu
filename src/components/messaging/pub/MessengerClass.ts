import IMessenger from "./IMessenger";
import {DMessage} from "./DMessage";
import EventEmitter from "../../events/pub/EventEmitter";

/**
 * A wrapper for a given class that implements IMessenger
 * by simply calling the class's methods and using an EventEmitter. 
 * The EventEmitter is assumed to be such that the wrappee class 
 * has access to it and can thus use it to trigger message events.
 */
export default class MessengerClass<C> implements IMessenger<DMessage, DMessage> {
    wrappee: C;
    wrappeeEmitter: EventEmitter;
    messageEvent: string;
    id: string;

    constructor(wrappee: C, wrappeeEmitter: EventEmitter, id: string = "") {
        this.wrappee = wrappee;
        this.wrappeeEmitter = wrappeeEmitter;
        this.messageEvent = "message";
        this.id = id;
    }

    /**
     * Call a method on the wrapped class. If the class 
     * returns a result value, it will be emitted as a response message. 
     * The given msg is assumed to be of type "request".
     */
    async _callMethod(msg: DMessage) {
        const result = await this.wrappee[msg.message.type](...msg.message.args);
        // If the result is not the wrapped class itself or undefined then we assume 
        // that the result value matters and we send it as a response message.
        if (
            result !== undefined && 
            !(typeof result === "object" && result.constructor === this.wrappee.constructor)
        ) {
            const responseMsg: DMessage = {
                sender: this.id,
                recipient: msg.sender,
                type: "response",
                message: {
                    type: msg.message.type,
                    args: [result]
                }
            };
            this.wrappeeEmitter.trigger(this.messageEvent, [responseMsg]);
        }
    }

    postMessage(msg: DMessage): IMessenger<DMessage, DMessage> {
        if (
            msg.type === "request" && 
            typeof this.wrappee === "object" && 
            msg.message.type in this.wrappee
        ) {
            this._callMethod(msg);
        }
        // Transform response message into event.
        if (msg.type === "response") {
            msg.type = "event";
            msg.message.type = "response:" + msg.message.type;
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

    onMessage(handler: (msg: DMessage) => void): IMessenger<DMessage, DMessage> {
        this.wrappeeEmitter.on(this.messageEvent, handler);
        return this;
    }
}