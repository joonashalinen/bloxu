"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ArithmeticSequence_1 = require("../../../../components/math/pub/ArithmeticSequence");
var DiscreetRoom_1 = require("../../../../components/messaging/pub/DiscreetRoom");
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
        this.hotel.createRoom = function (code) {
            var room = new DiscreetRoom_1.default(code);
            var aliasGenerator = new StringSequence_1.default(new ArithmeticSequence_1.default());
            aliasGenerator.prefix = "player-";
            room.aliasGenerator = aliasGenerator;
            return room;
        };
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
    OnlineSynchronizerServer.prototype.joinGame = function (code, player, messenger) {
        if (this.hotel.isInRoom(player)) {
            throw new Error("Player '" + player + "' is already in a game.");
        }
        this.hotel.joinRoom(code, player, messenger);
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
     * Causes player to leave the game they are in if they are in one.
     */
    OnlineSynchronizerServer.prototype.leaveGame = function (player) {
        this.hotel.leaveAllRooms(player);
        return true;
    };
    /**
     * The id of the player within the game they are in if they
     * are in one. For example, the first person to join the game is 'player-1'.
     */
    OnlineSynchronizerServer.prototype.playerIdInGame = function (player) {
        var room = this.hotel.rooms.find(function (r) { return r.isInRoom(player); });
        if (room === undefined) {
            throw new Error("Player ".concat(player, " is not currently in any game"));
        }
        else {
            return room.aliases[player];
        }
    };
    return OnlineSynchronizerServer;
}());
exports.default = OnlineSynchronizerServer;
