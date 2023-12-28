"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var EventEmitter_1 = require("../../../components/events/pub/EventEmitter");
/**
 * Provides the ability to create private rooms
 * for messaging between users. Users can join existing rooms
 * via a code shared by the room's host.
 */
var MessageHotel = /** @class */ (function () {
    function MessageHotel() {
        this.rooms = [];
        this.emitter = new EventEmitter_1.default();
    }
    /**
     * Host a new room and return the room code.
     */
    MessageHotel.prototype.hostRoom = function () {
        var code = this.generateRoomCode();
        var newRoom = {
            code: code,
            users: new Set()
        };
        this.rooms.push(newRoom);
        return code;
    };
    /**
     * Join an existing room using the provided room code.
     * Returns true if the join was successful, false otherwise.
     */
    MessageHotel.prototype.joinRoom = function (code, user) {
        var room = this.rooms.find(function (r) { return r.code === code; });
        if (room && !room.users.has(user)) {
            room.users.add(user);
            return true;
        }
        else {
            return false;
        }
    };
    /**
     * Removes user from all rooms they are in if they are in any.
     */
    MessageHotel.prototype.leaveAllRooms = function (user) {
        var rooms = this.rooms.filter(function (r) { return r.users.has(user); });
        rooms.forEach(function (room) {
            if (room) {
                room.users.delete(user);
            }
        });
        return true;
    };
    /**
     * Send a message from one user to another within the same room.
     */
    MessageHotel.prototype.sendMessage = function (sender, roomCode, content) {
        var room = this.rooms.find(function (room) { return room.code === roomCode; });
        if (room && room.users.has(sender)) {
            var message = {
                sender: sender,
                content: content
            };
            this.emitter.trigger("message", [{ recipient: room.code, message: message }]);
        }
        else {
            // Handle invalid sender, recipient, or rooms
        }
    };
    /**
     * Generate a random room code.
     */
    MessageHotel.prototype.generateRoomCode = function () {
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
    return MessageHotel;
}());
exports.default = MessageHotel;
