import EventEmitter from "../../events/pub/EventEmitter";
import IMessenger from "./IMessenger";

export default class ProxyMessenger<I, R> implements IMessenger<I, R> {
    public emitter = new EventEmitter();

    postMessage(msg: I): ProxyMessenger<I, R> {
        this.emitter.trigger("postMessage", [msg]);
        return this;
    }

    onMessage(handler: (msg: R) => void): ProxyMessenger<I, R> {
        this.emitter.on("message", handler);
        return this;
    }

    offMessage(handler: (msg: R) => void): ProxyMessenger<I, R> {
        this.emitter.off("message", handler);
        return this;
    }

    /**
     * Listen to calls to postMessage.
     */
    onPostMessage(handler: (msg: I) => void) {
        this.emitter.on("postMessage", handler);
        return this;
    }

    /**
     * Manually cause ProxyMessenger to send a message.
     */
    message(msg: R) {
        this.emitter.trigger("message", [msg]);
        return this;
    }
}
