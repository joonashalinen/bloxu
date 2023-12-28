import EventEmitter from "../../../events/pub/EventEmitter";
import IMessenger from "../../../messaging/pub/IMessenger";

export default class WebSocketMessenger<A, B> implements IMessenger<A, B> {
    emitter: EventEmitter;

    constructor(public socket: WebSocket) {
        this.emitter = new EventEmitter();

        this.socket.addEventListener('message', (event) => {
            const parsedMessage: B = JSON.parse(event.data);
            this.emitter.trigger("message", [parsedMessage]);
        });
    }

    postMessage(msg: A): IMessenger<A, B> {
        const serializedMsg = typeof msg !== "string" ? JSON.stringify(msg) : msg;
        this.socket.send(serializedMsg);
        return this;
    }

    onMessage(handler: (msg: B) => void): IMessenger<A, B> {
        this.emitter.on("message", handler);
        return this;
    }

    offMessage(handler: (msg: B) => void): IMessenger<A, B> {
        this.emitter.off("message", handler);
        return this;
    }
}
