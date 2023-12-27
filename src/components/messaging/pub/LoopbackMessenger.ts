import EventEmitter from "../../events/pub/EventEmitter";
import IMessenger from "./IMessenger";

export default class LoopbackMessenger<A> implements IMessenger<A, A> {
    public emitter = new EventEmitter();

    postMessage(msg: A): LoopbackMessenger<A> {
        setTimeout(() => {
            this.emitter.trigger("message", [msg]);
        }, 0);

        return this;
    }

    onMessage(handler: (msg: A) => void): LoopbackMessenger<A> {
        this.emitter.on("message", handler);
        return this;
    }
}
