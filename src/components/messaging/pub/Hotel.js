"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var EventEmitter_1 = require("../../../components/events/pub/EventEmitter");
var Mediator_1 = require("./Mediator");
var Room_1 = require("./Room");
/**
 * Provides the ability to create private rooms
 * for messaging between IMessengers. IMessengers can
 * either host their own rooms or join existing rooms
 * via a code shared by the room's host.
 */
var Hotel = /** @class */ (function () {
    function Hotel() {
        this.rooms = [];
        this.mediator = new Mediator_1.default();
        this.emitter = new EventEmitter_1.default();
        this.createRoom = function (code) { return new Room_1.default(code); };
    }
    /**
     * Whether given messenger is already in a room.
     */
    Hotel.prototype.isInRoom = function (messengerId) {
        var room = this.rooms.find(function (r) { return r.isInRoom(messengerId); });
        return (room !== undefined);
    };
    /**
     * Whether there is a room that can be joined with the given code.
     */
    Hotel.prototype.roomWithCodeExists = function (code) {
        var room = this.rooms.find(function (r) { return r.code === code; });
        return (room !== undefined);
    };
    /**
     * Host a new room and return the room code.
     */
    Hotel.prototype.hostRoom = function () {
        var code = this.generateRoomCode();
        var newRoom = this.createRoom(code);
        this.rooms.push(newRoom);
        return code;
    };
    /**
     * Join an existing room using the provided room code.
     * Returns true if the join was successful, false otherwise.
     */
    Hotel.prototype.joinRoom = function (code, messengerId, messenger) {
        var room = this.rooms.find(function (r) { return r.code === code; });
        if (room !== undefined) {
            room.join(messengerId, messenger);
            return true;
        }
        else {
            return false;
        }
    };
    /**
     * Removes messenger from all rooms they are in if they are in any.
     */
    Hotel.prototype.leaveAllRooms = function (messengerId) {
        var rooms = this.rooms.filter(function (r) { return r.isInRoom(messengerId); });
        rooms.forEach(function (room) {
            if (room) {
                room.leave(messengerId);
            }
        });
        return true;
    };
    /**
     * Generate a random room code.
     */
    Hotel.prototype.generateRoomCode = function () {
        var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        var codeLength = 6;
        var code = "";
        for (var i = 0; i < codeLength; i++) {
            var randomIndex = Math.floor(Math.random() * characters.length);
            code += characters[randomIndex];
        }
        if (this.rooms.find(function (room) { return room.code === code; })) {
            return this.generateRoomCode();
        }
        else {
            return code;
        }
    };
    return Hotel;
}());
exports.default = Hotel;
