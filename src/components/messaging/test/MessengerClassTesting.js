"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testMessages = exports.createMessenger = void 0;
var globals_1 = require("@jest/globals");
var MessengerClass_1 = require("../pub/MessengerClass");
var EventEmitter_1 = require("../../events/pub/EventEmitter");
function createMessenger() {
    var obj = { test: globals_1.jest.fn() };
    var emitter = new EventEmitter_1.default();
    var messenger = new MessengerClass_1.default(obj, emitter);
    return [messenger, emitter, obj];
}
exports.createMessenger = createMessenger;
exports.testMessages = {
    "type1": {
        sender: "sender1",
        recipient: "recipient1",
        type: "request",
        message: {
            type: "test",
            args: ["test"]
        }
    }
};
