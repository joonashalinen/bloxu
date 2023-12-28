import EventEmitter from "../../../../components/events/pub/EventEmitter";
import { DMessage } from "../../../../components/messaging/pub/DMessage";
import ProxyMessenger from "../../../../components/messaging/pub/ProxyMessenger";
import SyncMessenger from "../../../../components/messaging/pub/SyncMessenger";
import WebSocketMessenger from "../../../../components/network/pub/browser/WebSocketMessenger";

/**
 * Contains the operations and state of the 
 * OnlineSynchronizerClient service.
 */
export default class OnlineSynchronizerClient {
    proxyMessenger = new ProxyMessenger<DMessage, DMessage>();
    socketToServer: WebSocket;
    messengerToServer: WebSocketMessenger<DMessage, DMessage>;
    syncMessengerToServer: SyncMessenger;
    serverEventHandlers: {[name: string]: Function}
    playerId: string;

    constructor() {

        // vvv Set properties. vvv

        this.playerId = "onlineSynchronizerClient";
        this.serverEventHandlers = {};
        this.socketToServer = new WebSocket("ws://localhost:3000");
        this.messengerToServer = new WebSocketMessenger(this.socketToServer);
        this.syncMessengerToServer = new SyncMessenger(this.messengerToServer);
    }

    /**
     * Makes a synchronous request to the server. Returns the result.
     */
    async makeSyncRequestToServer(type: string, args: Array<unknown> = []) {
        return (await this.syncMessengerToServer.postSyncMessage({
            recipient: "onlineSynchronizerServer",
            sender: this.playerId,
            type: "request",
            message: {
                type: type,
                args: args
            }
        }));
    }

    /**
     * Initialization procedure for the OnlineSynchronizer service. 
     * Once initialization is finished, the service can be used.
     */
    async initialize() {
        // vvv Setup WebSocket connection to OnlineSynchronizerServer. vvv

        this.socketToServer.addEventListener("error", (event) => {
            console.log("Error occurred when trying to open websocket.");
            console.log(event);
        })

        // If the websocket connection has not opened yet.
        if (this.socketToServer.readyState === WebSocket.CONNECTING) {
            // Wait for connection to open.
            await new Promise((resolve, reject) => {
                this.socketToServer.addEventListener("open", (event) => {
                    resolve(event);
                });
            });
        }

        this.playerId = (await this.makeSyncRequestToServer("playerId"))[0] as string;

        // Listen to messages from the server.
        this.messengerToServer.onMessage((msg) => {
            // Ignore responses. We use SyncMessenger for messages with responses.
            if (msg.type === "response") {return}

            // If the message is not a metadata message to the client 
            // but instead a message to the other services then we redirect it.
            if (Array.isArray(msg.subRecipients) && msg.subRecipients.length > 0) {
                const redirectedMsg = {
                    ...msg,
                    // Within the browser environment there is only an 'onlineSynchronizer' service.
                    // In other words, the other browser services do not know or care about the split between 
                    // onlineSynchronizerClient and onlineSynchronizerServer. Thus,
                    // we need to rename the sender field. Also, the next sub-recipient becomes 
                    // the new main recipient.
                    sender: "onlineSynchronizer",
                    recipient: msg.subRecipients[0]
                };
                redirectedMsg.subRecipients.unshift();
                this.proxyMessenger.postMessage(redirectedMsg);
            
            } else {
                if (msg.type === "event" && msg.message.type in this.serverEventHandlers) {
                    this.serverEventHandlers[msg.message.type](...msg.message.args);
                }
            }
        })

    }

    /**
     * Host a new game.
     */
    async hostGame() {
        const code = (await this.makeSyncRequestToServer("hostGame"))[0];
        (await this.makeSyncRequestToServer("joinGame", [code, this.playerId]));
        return code;
    }
}