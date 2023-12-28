"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var MessageHotel_1 = require("../../../../components/messaging/pub/MessageHotel");
var ProxyMessenger_1 = require("../../../../components/messaging/pub/ProxyMessenger");
/**
 * Contains the operations and state of the
 * OnlineSynchronizerServer service.
 */
var OnlineSynchronizerServer = /** @class */ (function () {
    function OnlineSynchronizerServer() {
        this._runningPlayerId = 1;
        this.messageHotel = new MessageHotel_1.default();
        this.proxyMessenger = new ProxyMessenger_1.default();
    }
    /**
     * Generates a new player id.
     */
    OnlineSynchronizerServer.prototype.newPlayerId = function () {
        var id = this._runningPlayerId.toString();
        this._runningPlayerId = this._runningPlayerId + 1;
        return id;
    };
    /**
     * Join a game using a code given by the host of the game.
     */
    OnlineSynchronizerServer.prototype.joinGame = function (code, user) {
        this.messageHotel.joinRoom(code, user);
        console.log(this.messageHotel.rooms);
        return true;
    };
    /**
     * Host a new game. Returns the code that
     * can be used to invite other players into the game.
     */
    OnlineSynchronizerServer.prototype.hostGame = function () {
        return this.messageHotel.hostRoom();
    };
    return OnlineSynchronizerServer;
}());
exports.default = OnlineSynchronizerServer;
