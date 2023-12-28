"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ArithmeticSequence_1 = require("../../../../components/math/pub/ArithmeticSequence");
var Hotel_1 = require("../../../../components/messaging/pub/Hotel");
var ProxyMessenger_1 = require("../../../../components/messaging/pub/ProxyMessenger");
var StringSequence_1 = require("../../../../components/strings/pub/StringSequence");
/**
 * Contains the operations and state of the
 * OnlineSynchronizerServer service.
 */
var OnlineSynchronizerServer = /** @class */ (function () {
    function OnlineSynchronizerServer() {
        this.playerIdGenerator = new StringSequence_1.default(new ArithmeticSequence_1.default());
        this.hotel = new Hotel_1.default();
        this.proxyMessenger = new ProxyMessenger_1.default();
    }
    /**
     * Generate new unique player id.
     */
    OnlineSynchronizerServer.prototype.newPlayerId = function () {
        return this.playerIdGenerator.next();
    };
    /**
     * Join a game using a code given by the host of the game.
     */
    OnlineSynchronizerServer.prototype.joinGame = function (code, user) {
        /* if (this.hotel.isInRoom(user)) {
            throw new Error("User '" + user + "' is already in a game.");
        }
        this.hotel.joinRoom(code, user); */
        return true;
    };
    /**
     * Host a new game. Returns the code that
     * can be used to invite other players into the game.
     */
    OnlineSynchronizerServer.prototype.hostGame = function () {
        return this.hotel.hostRoom();
    };
    /**
     * Causes user to leave the game they are in if they are in one.
     */
    OnlineSynchronizerServer.prototype.leaveGame = function (user) {
        /* this.hotel.leaveAllRooms(user); */
    };
    return OnlineSynchronizerServer;
}());
exports.default = OnlineSynchronizerServer;
