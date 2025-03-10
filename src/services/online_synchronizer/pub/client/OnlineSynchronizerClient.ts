import { DMessage } from "../../../../components/messaging/pub/DMessage";
import MessageFactory from "../../../../components/messaging/pub/MessageFactory";
import ProxyMessenger from "../../../../components/messaging/pub/ProxyMessenger";
import SyncMessenger from "../../../../components/messaging/pub/SyncMessenger";
import WebSocketMessenger from "../../../../components/network/pub/browser/WebSocketMessenger";
import getEventsConfig from "../../conf/events";

interface IEventsConfig {
    redirect: string[];
}

/**
 * Contains the operations and state of the 
 * OnlineSynchronizerClient service.
 */
export default class OnlineSynchronizerClient {

    websocketServerAddress = "wss://joonashalinen.net:3000";
    proxyMessenger = new ProxyMessenger<DMessage, DMessage>();
    serviceId = "onlineSynchronizerClient";
    // We do not know our player id within the game yet until we join one.
    // The id within a game indicates whether we are player 1 or 2.
    // Whoever first joins the game is player 1.
    // The in-game player id is by default 'onlineSynchronizerClient' for 
    // the first 'joinGame' message, after which it will be set to the 
    // real in-game player id.
    playerIdInGame = this.serviceId;
    eventHandlers: {[name: string]: Function};
    eventsConfig: IEventsConfig;
    
    // This WebSocket is used to communicate with OnlineSynchronizerServer.
    socketToServer: WebSocket = new WebSocket(this.websocketServerAddress);
    messengerToServer = new WebSocketMessenger<DMessage, DMessage>(this.socketToServer);
    syncMessengerToServer = new SyncMessenger(this.messengerToServer);
    serverMessageFactory = new MessageFactory(this.serviceId);
    serverConnectionId = "";

    // This WebSocket is used to communicate with other 
    // players within a joined game.
    gameSocket: WebSocket = new WebSocket(this.websocketServerAddress);
    gameMessenger = new WebSocketMessenger<DMessage, DMessage>(this.gameSocket);
    gameSyncMessenger = new SyncMessenger(this.gameMessenger);
    gameMessageFactory = new MessageFactory(this.playerIdInGame);
    gameConnectionId = "";
    joinedGame = false;

    constructor() {
        this.eventHandlers = {
            "*": this.onAnyEvent.bind(this)
        };
        this.eventsConfig = getEventsConfig();
    }

    /**
     * Makes a synchronous request to the server. Returns the result.
     */
    async makeSyncRequestToServer(type: string, args: Array<unknown> = []) {
        return (await this.syncMessengerToServer.postSyncMessage(
            this.serverMessageFactory.createRequest("onlineSynchronizerServer", type, args)
        ));
    }

    /**
     * Sends an event message to the server.
     */
    async sendEventToServer(type: string, args: Array<unknown> = []) {
        this.messengerToServer.postMessage(
            this.serverMessageFactory.createEvent("onlineSynchronizerServer", type, args)
        );
    }

    /**
     * Makes a synchronous request to the server through the connection 
     * used for in-game messaging between players (this.gameMessenger).
     * We make two requests 'playerId' and 'joinGame' before the connection 
     * switches to in-game only, which is why this method exists.
     */
    async makeGameConnectionSyncRequest(type: string, args: Array<unknown> = []) {
        return (await this.gameSyncMessenger.postSyncMessage(
            this.gameMessageFactory.createRequest("onlineSynchronizerServer", type, args)
        ));
    }

    /**
     * Sends an event message to the other players in the currently joined game.
     */
    async sendEventInGame(to: string, type: string, args: Array<unknown> = []) {
        const msg = this.gameMessageFactory.createEvent("*", type, args);
        
        // Set subrecipients.
        if (to !== "") {
            msg.subRecipients = [to];
        }

        this.gameMessenger.postMessage(msg);
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

        // Ensure the websocket connections have opened before using them.
        await this.messengerToServer.waitForOpen();
        await this.gameMessenger.waitForOpen();

        // Retrieve the ids of our connections to the 
        // server so that we can set the proper 'sender' field 
        // for future requests. 'playerId' is the only request for 
        // which it is fine to have the default connection id.
        this.serverConnectionId = await this.makeSyncRequestToServer("playerId") as string;
        this.gameConnectionId = await this.makeGameConnectionSyncRequest("playerId") as string;
        this.serverMessageFactory.sender = this.serverConnectionId;
        this.gameMessageFactory.sender = this.gameConnectionId;

        // Listen to messages from the joined game (if a game has been joined).
        this.gameMessenger.onMessage((msg) => {
            // Ignore responses. We use SyncMessenger for messages with responses.
            // There is some synchronous messaging done on the game room's connection
            // during setup before joining a game.
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
                redirectedMsg.subRecipients!.unshift();
                this.proxyMessenger.postMessage(redirectedMsg);
            
            } else {
                // Currently there is no metadata messaging, which is why we do nothing.
                console.log("New metadata message for OnlineSynchronizerClient:");
                console.log(msg);
            }
        })

        return true;
    }

    /**
     * Host a new game.
     */
    async hostGame() {
        const code = await this.makeSyncRequestToServer("hostGame") as string;
        const playerIdInGame = await this.joinGame(code);
        return [code, playerIdInGame];
    }

    /**
     * Join an existing game by using a code.
     */
    async joinGame(code: string) {
        const response = await this.makeGameConnectionSyncRequest(
            "joinGame", 
            [code, this.gameConnectionId]
        ) as string | {error: string};
        
        // If no error occurred.
        if (typeof response === "string") {
            this.playerIdInGame = response;
            this.joinedGame = true;
            // Let the other players in the room know that this player has joined.
            this.sendEventInGame("*", "OnlineSynchronizer:<event>remotePlayerJoined", [this.playerIdInGame]);
        }
        
        return response;
    }

    /**
     * Fallback for any event that does not 
     * have a specific handler.
     */
    onAnyEvent(msg: DMessage) {
        // If the message is from the local player or is one of the 
        // manually set events that we wish to redirect to the 
        // local player's mirror services in other players' games.
        if (this.joinedGame && (msg.sender === this.playerIdInGame || 
            this.eventsConfig.redirect.includes(msg.message.type))) {
            // Redirect the event to the player's mirror services on the 
            // other players' games. We wrap the event with the tag 'OnlineSynchronizer'
            // so that the remote player knows it is a synchronization message.
            this.sendEventInGame(msg.sender, `OnlineSynchronizer:${msg.message.type}`, msg.message.args);
        }
    }
}