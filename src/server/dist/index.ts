import * as express from "express";
import * as path from "path";
import * as https from "https";
import * as fs from "fs";
import { WebSocketServer } from 'ws';
import OnlineSynchronizerServer from "../../services/online_synchronizer/pub/server/OnlineSynchronizerServer";
import { WebSocket} from 'ws';
import MessengerClass from "../../components/messaging/pub/MessengerClass";
import Mediator from "../../components/messaging/pub/Mediator";
import { IMediator } from "../../components/messaging/pub/IMediator";
import WebSocketMessenger from "../../components/network/pub/server/WebSocketMessenger";
import { DMessage } from "../../components/messaging/pub/DMessage";
import IEventable from "../../components/events/pub/IEventable";

/**
 * Provides the entry point and state of 
 * the Bloxu game's server-side process.
 */
export default class Server {
    onlineSynchronizer: OnlineSynchronizerServer;
    synchronizerMessenger: MessengerClass<OnlineSynchronizerServer>;
    webSockets: {[id: string]: WebSocket};
    expressApp: express.Application;
    websocketServer: WebSocketServer;
    mediator: IMediator & IEventable;

    constructor() {
        this.onlineSynchronizer = new OnlineSynchronizerServer();
        this.synchronizerMessenger = new MessengerClass(
            this.onlineSynchronizer, 
            this.onlineSynchronizer.proxyMessenger,
            "onlineSynchronizerServer"
        );
        this.webSockets = {};
        
        this.mediator = new Mediator({"onlineSynchronizerServer": this.synchronizerMessenger});
        this.mediator.emitter.on("error", (error: Error, actorName: string, msg: DMessage) => {
            console.log("Error occurred in Mediator for actor '" + actorName + "'.");
            console.log("The message was: " + msg);
            console.log("Error was: " + error.toString());
        });

        this.startExpressServer();
        this.startWebSocketServer();
    }

    startExpressServer() {
        const app = (express as unknown as Function)();
        this.expressApp = app;

        app.use(express.static("public"))

        app.get('/', (req, res) => {
            res.sendFile('public/index.html')
        });
        
        const server = https.createServer({
                key: fs.readFileSync('key.pem'),
                cert: fs.readFileSync('cert.pem'),
        }, app);
        
        server.listen(443);

        return app;
    }
    
    startWebSocketServer() {
        const wss = new WebSocketServer({ port: 3000 });
        this.websocketServer = wss;

        // When a new websocket connects.
        wss.on('connection', (ws) => {
            console.log("websocket connected");
            
            // Save the websocket with its own new unique id.
            const playerId = this.onlineSynchronizer.newPlayerId();
            this.webSockets[playerId] = ws;

            const messenger = new WebSocketMessenger<DMessage, DMessage>(ws);
            // Disable onMessage, since we want to manually control redirection of 
            // messages coming in from the websocket.
            const originalOnMessage = messenger.onMessage;
            messenger.onMessage = () => undefined;

            // Add the websocket into the Mediator so that it 
            // can receive messages from OnlineSynchronizerServer.
            this.mediator.addActor(playerId, messenger);
            
            // Setup error listener. Mediator will not set this so we must set it ourselves.
            ws.on('error', console.error);

            // Manually capture all incoming messages from the websocket.
            ws.on("message", async (data) => {
                const msg: DMessage = JSON.parse(data.toString());
                // Handle player id request here since we know the id and OnlineSynchronizerServer does not.
                if (
                    msg.type === "request" && 
                    msg.message.type === "playerId"
                ) {
                    ws.send(JSON.stringify({
                        sender: "onlineSynchronizerServer",
                        recipient: msg.sender,
                        type: "response",
                        id: msg.id,
                        message: {
                            type: "playerId",
                            args: [playerId]
                        }
                    }))
                } else if (msg.type === "request" && msg.message.type === "joinGame") {
                    // If the player wishes to join a game, we move this websocket connection
                    // into a private room. This means we remove it from the original Mediator.
                    // Thus, this connection will no longer be able to communicate to OnlineSynchronizerServer.
                    // Instead, the connection can communicate with the other players in the same room.
                    
                    const messenger = this.mediator.actors[playerId];
                    // Re-enable onMessage so it can receive messages from other players 
                    // in the private room.
                    messenger.onMessage = originalOnMessage;
                    // The messenger is given as the last argument to OnlineSynchronizerServer.joinGame.
                    // OnlineSynchronizerServer will move the messenger into a private room.
                    msg.message.args.push(messenger);
                    // Now we let OnlineSynchronizerServer handle the 'joinGame' message.
                    this.synchronizerMessenger.postMessage(msg);

                    const onResponse = (msg) => {
                        console.log(msg);
                        const errorOccurred = (
                            msg.message.args.length > 0 && 
                            typeof msg.message.args[0] === "object" && 
                            "error" in msg.message.args[0]
                        );
                        if (!errorOccurred) {
                            // Remove ourselves from the current iteration of 
                            // the nodejs event loop so that the message 
                            // gets sent first to its destination.
                            setTimeout(() => {
                                // Now, try to remove the connection's access to OnlineSynchronizerServer.
                                try {
                                    this.mediator.removeActor(playerId);
                                } catch (e) {
                                    console.log(e);
                                }
                            }, 0);
                        }
                        this.mediator.offMessageFor(playerId, onResponse);
                    };
                    // Wait for the response to 'joinGame' before removing the connection 
                    // from the Mediator. If we do not wait for the response, 
                    // then a reply cannot be sent back from OnlineSynchronizerServer, 
                    // since the websocket connection is no longer present in the Mediator.
                    this.mediator.onMessageFor(playerId, onResponse);
                    
                } else {
                    // Redirect message to OnlineSynchronizerServer.
                    this.synchronizerMessenger.postMessage(msg);
                }
            });

            // Remove the user from any rooms they are in once the websocket connection closes.
            ws.on("close", () => {
                if (this.onlineSynchronizer.hotel.isInRoom(playerId)) {
                    this.onlineSynchronizer.leaveGame(playerId);
                }
                console.log("player " + playerId + " disconnected");
            })
        });
        return wss;
    }

}

const server = new Server();