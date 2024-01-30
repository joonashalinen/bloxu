"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var ws_1 = require("ws");
var OnlineSynchronizerServer_1 = require("../../services/online_synchronizer/pub/server/OnlineSynchronizerServer");
var MessengerClass_1 = require("../../components/messaging/pub/MessengerClass");
var Mediator_1 = require("../../components/messaging/pub/Mediator");
var WebSocketMessenger_1 = require("../../components/network/pub/server/WebSocketMessenger");
/**
 * Provides the entry point and state of
 * the Bloxu game's server-side process.
 */
var Server = /** @class */ (function () {
    function Server() {
        this.onlineSynchronizer = new OnlineSynchronizerServer_1.default();
        this.synchronizerMessenger = new MessengerClass_1.default(this.onlineSynchronizer, this.onlineSynchronizer.proxyMessenger, "onlineSynchronizerServer");
        this.webSockets = {};
        this.mediator = new Mediator_1.default({ "onlineSynchronizerServer": this.synchronizerMessenger });
        this.mediator.emitter.on("error", function (error, actorName, msg) {
            console.log("Error occurred in Mediator for actor '" + actorName + "'.");
            console.log("The message was: " + msg);
            console.log("Error was: " + error.toString());
        });
        this.startExpressServer();
        this.startWebSocketServer();
    }
    Server.prototype.startExpressServer = function () {
        var app = express();
        this.expressApp = app;
        var port = 3001;
        app.use(express.static("public"));
        app.get('/', function (req, res) {
            res.sendFile('public/index.html');
        });
        app.listen(port, function () {
            console.log("Example app listening on port ".concat(port));
        });
        return app;
    };
    Server.prototype.startWebSocketServer = function () {
        var _this = this;
        var wss = new ws_1.WebSocketServer({ port: 3000 });
        this.websocketServer = wss;
        // When a new websocket connects.
        wss.on('connection', function (ws) {
            console.log("websocket connected");
            // Save the websocket with its own new unique id.
            var playerId = _this.onlineSynchronizer.newPlayerId();
            _this.webSockets[playerId] = ws;
            var messenger = new WebSocketMessenger_1.default(ws);
            // Disable onMessage, since we want to manually control redirection of 
            // messages coming in from the websocket.
            var originalOnMessage = messenger.onMessage;
            messenger.onMessage = function () { return undefined; };
            // Add the websocket into the Mediator so that it 
            // can receive messages from OnlineSynchronizerServer.
            _this.mediator.addActor(playerId, messenger);
            // Setup error listener. Mediator will not set this so we must set it ourselves.
            ws.on('error', console.error);
            // Manually capture all incoming messages from the websocket.
            ws.on("message", function (data) { return __awaiter(_this, void 0, void 0, function () {
                var msg, messenger_1;
                var _this = this;
                return __generator(this, function (_a) {
                    msg = JSON.parse(data.toString());
                    // Handle player id request here since we know the id and OnlineSynchronizerServer does not.
                    if (msg.type === "request" &&
                        msg.message.type === "playerId") {
                        ws.send(JSON.stringify({
                            sender: "onlineSynchronizerServer",
                            recipient: msg.sender,
                            type: "response",
                            id: msg.id,
                            message: {
                                type: "playerId",
                                args: [playerId]
                            }
                        }));
                    }
                    else if (msg.type === "request" && msg.message.type === "joinGame") {
                        messenger_1 = this.mediator.actors[playerId];
                        // Re-enable onMessage so it can receive messages from other players 
                        // in the private room.
                        messenger_1.onMessage = originalOnMessage;
                        // The messenger is given as the last argument to OnlineSynchronizerServer.joinGame.
                        // OnlineSynchronizerServer will move the messenger into a private room.
                        msg.message.args.push(messenger_1);
                        // Now we let OnlineSynchronizerServer handle the 'joinGame' message.
                        this.synchronizerMessenger.postMessage(msg);
                        // Wait for the response to 'joinGame' before removing the connection 
                        // from the Mediator. If we do not wait for the response, 
                        // then a reply cannot be sent back from OnlineSynchronizerServer, 
                        // since the websocket connection is no longer present in the Mediator.
                        this.mediator.onMessageFor(playerId, function (msg) {
                            // Remove ourselves from the current iteration of 
                            // the nodejs event loop so that the message 
                            // gets sent first to its destination.
                            setTimeout(function () {
                                // Now, try to remove the connection's access to OnlineSynchronizerServer.
                                try {
                                    _this.mediator.removeActor(playerId);
                                }
                                catch (e) {
                                    console.log(e);
                                }
                            }, 0);
                        });
                    }
                    else {
                        // Redirect message to OnlineSynchronizerServer.
                        this.synchronizerMessenger.postMessage(msg);
                    }
                    return [2 /*return*/];
                });
            }); });
            // Remove the user from any rooms they are in once the websocket connection closes.
            ws.on("close", function () {
                if (_this.onlineSynchronizer.hotel.isInRoom(playerId)) {
                    _this.onlineSynchronizer.leaveGame(playerId);
                }
                console.log("player " + playerId + " disconnected");
            });
        });
        return wss;
    };
    return Server;
}());
exports.default = Server;
var server = new Server();
