"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var MessageHotel_1 = require("../pub/MessageHotel");
var globals_1 = require("@jest/globals");
(0, globals_1.describe)('MessageHotel', function () {
    var messageHotel;
    (0, globals_1.beforeEach)(function () {
        messageHotel = new MessageHotel_1.default();
    });
    (0, globals_1.it)('should host a new room and return the room code', function () {
        var code = messageHotel.hostRoom();
        (0, globals_1.expect)(code).toHaveLength(6); // Assuming room code length is always 6 characters
        (0, globals_1.expect)(messageHotel.rooms).toHaveLength(1);
    });
    (0, globals_1.it)('should join an existing room and return true', function () {
        var code = messageHotel.hostRoom();
        var user = 'John';
        var joined = messageHotel.joinRoom(code, user);
        (0, globals_1.expect)(joined).toBe(true);
        (0, globals_1.expect)(messageHotel.rooms[0].users).toContain(user);
    });
    (0, globals_1.it)('should not join a non-existing room and return false', function () {
        var user = 'John';
        var joined = messageHotel.joinRoom('nonexistentcode', user);
        (0, globals_1.expect)(joined).toBe(false);
    });
    (0, globals_1.it)('should send a message within the same room', function () {
        var sender = 'John';
        var recipient = 'Jane';
        var content = 'Hello, Jane!';
        var code = messageHotel.hostRoom();
        messageHotel.joinRoom(code, sender);
        messageHotel.joinRoom(code, recipient);
        var emitSpy = globals_1.jest.spyOn(messageHotel['emitter'], 'trigger');
        messageHotel.sendMessage(sender, code, content);
        (0, globals_1.expect)(emitSpy).toHaveBeenCalledWith("message", [
            { recipient: code, message: { sender: sender, content: content } },
        ]);
    });
    (0, globals_1.it)('should not send a message if room is invalid', function () {
        var sender = 'John';
        var content = 'Hello, Jane!';
        var code = messageHotel.hostRoom();
        var invalidCode = messageHotel.hostRoom();
        messageHotel.joinRoom(code, sender);
        var emitSpy = globals_1.jest.spyOn(messageHotel['emitter'], 'trigger');
        messageHotel.sendMessage(sender, code, content);
        messageHotel.sendMessage(sender, invalidCode, content);
        (0, globals_1.expect)(emitSpy).toHaveBeenCalledTimes(1); // Only one valid message
    });
});
