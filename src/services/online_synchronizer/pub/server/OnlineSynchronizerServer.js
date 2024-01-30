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
        this.gameParticipantHistory = {};
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
        if (!(this.hotel.roomWithCodeExists(code))) {
            throw new Error("Trying to join a non-existent game: " + code);
        }
        // FIX THIS: Here we assume that a game has started if it has 
        // two players that have joined it. This assumption may change in the future.
        if (this.gameParticipantHistory[code].length > 1) {
            throw new Error("Trying to join a game that has already started.");
        }
        var joined = this.hotel.joinRoom(code, player, messenger);
        if (!joined) {
            throw new Error("Could not join room.");
        }
        else {
            this.gameParticipantHistory[code].push(player);
            return this.playerIdInGame(player);
        }
    };
    /**
     * Host a new game. Returns the code that
     * can be used to invite other players into the game.
     */
    OnlineSynchronizerServer.prototype.hostGame = function () {
        var code = this.hotel.hostRoom();
        this.gameParticipantHistory[code] = [];
        return code;
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
            console.log(room.aliases[player]);
            return room.aliases[player];
        }
    };
    return OnlineSynchronizerServer;
}());
exports.default = OnlineSynchronizerServer;
