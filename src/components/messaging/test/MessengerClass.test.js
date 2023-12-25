"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var globals_1 = require("@jest/globals");
var MessengerClassTesting_1 = require("./MessengerClassTesting");
(0, globals_1.test)("postMessage", function () {
    var _a = (0, MessengerClassTesting_1.createMessenger)(), messenger = _a[0], emitter = _a[1], obj = _a[2];
    messenger.postMessage(MessengerClassTesting_1.testMessages.type1);
    (0, globals_1.expect)(obj.test.mock.calls).toEqual([["test"]]);
});
(0, globals_1.test)("onMessage", function () {
    var _a = (0, MessengerClassTesting_1.createMessenger)(), messenger = _a[0], emitter = _a[1], obj = _a[2];
    var onMessage = globals_1.jest.fn();
    messenger.onMessage(onMessage);
    emitter.trigger("message", ["test"]);
    (0, globals_1.expect)(onMessage.mock.calls).toEqual([["test"]]);
});
