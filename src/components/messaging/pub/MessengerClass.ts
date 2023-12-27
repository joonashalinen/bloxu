import IMessenger from "./IMessenger";
import {DMessage} from "./DMessage";
import EventEmitter from "../../events/pub/EventEmitter";
import ProxyMessenger from "./ProxyMessenger";

type Messenger = IMessenger<DMessage, DMessage>;

/**
 * A wrapper for a given class that implements IMessenger
 * by simply calling the class's methods and using a ProxyMessenger. 
 * The ProxyMessenger is assumed to be such that the wrappee class 
 * has access to it and can thus use it to send and receive messages to and from MessengerClass.
 */
export default class MessengerClass<C> implements IMessenger<DMessage, DMessage> {
    emitter: EventEmitter = new EventEmitter();

    constructor(
        public wrappee: C, 
        public proxyMessenger: ProxyMessenger<DMessage, DMessage>, 
        public id: string = ""
    ) {
        proxyMessenger.onPostMessage((msg) => this.emitter.trigger("message", [msg]));
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
            this.emitter.trigger("message", [responseMsg]);
        }
    }

    postMessage(msg: DMessage): Messenger {
        if (
            msg.type === "request" && 
            typeof this.wrappee === "object" && 
            msg.message.type in this.wrappee
        ) {
            this._callMethod(msg);

        } else if (msg.type === "response") {
            this.proxyMessenger.message(msg);

        } else if (msg.type === "event") {
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

    onMessage(handler: (msg: DMessage) => void): Messenger {
        this.emitter.on("message", handler);
        return this;
    }
}