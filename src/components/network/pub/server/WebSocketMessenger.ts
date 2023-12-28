import {Data, WebSocket} from 'ws';
import IMessenger from '../../../messaging/pub/IMessenger';

export default class WebSocketMessenger<A, B> implements IMessenger<A, B> {
    private ws: WebSocket;
    private messageHandlers: ((msg: B) => void)[] = [];

    constructor(socket: WebSocket) {
        this.ws = socket;
        this.setupWebSocket();
    }

    private setupWebSocket() {
        this.ws.on('message', (data: Data) => {
            try {
                const parsedData: B = JSON.parse(data.toString());
                this.messageHandlers.forEach(handler => handler(parsedData));
            } catch (error) {
                throw new Error('Error parsing incoming message:' + error);
            }
        });
    }

    postMessage(msg: A): IMessenger<A, B> {
        try {
            const serializedMsg = JSON.stringify(msg);
            this.ws.send(serializedMsg);
        } catch (error) {
            throw new Error('Error sending message: ' + error);
        }
        return this;
    }

    onMessage(handler: (msg: B) => void): IMessenger<A, B> {
        this.messageHandlers.push(handler);
        return this;
    }

    offMessage(handler: (msg: B) => void): IMessenger<A, B> {
        const handlerIndex = this.messageHandlers.indexOf(handler);
        if (handlerIndex !== -1) {
            this.messageHandlers.splice(handlerIndex, 1);
        }
        return this;
    }
}
