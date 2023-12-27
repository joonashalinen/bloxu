"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var globals_1 = require("@jest/globals");
var Mediator_1 = require("../pub/Mediator");
var MessengerClassTesting_1 = require("./MessengerClassTesting");
(0, globals_1.test)("postMessage", function () {
    var _a = (0, MessengerClassTesting_1.createMessenger)(), messenger = _a[0], proxy = _a[1], obj = _a[2];
    var mediator = new Mediator_1.default({ "recipient1": messenger });
    mediator.postMessage(MessengerClassTesting_1.testMessages.type1);
    (0, globals_1.expect)(messenger.wrappee.test.mock.calls).toEqual([["test"]]);
});
(0, globals_1.test)("actor can message another actor by producing a message event", function () {
    var _a = (0, MessengerClassTesting_1.createMessenger)(), messenger = _a[0], proxy = _a[1], obj = _a[2];
    var _b = (0, MessengerClassTesting_1.createMessenger)(), messenger2 = _b[0], proxy2 = _b[1], obj2 = _b[2];
    var mediator = new Mediator_1.default({ "sender1": messenger, "recipient1": messenger2 });
    proxy.postMessage(MessengerClassTesting_1.testMessages.type1);
    (0, globals_1.expect)(messenger2.wrappee.test.mock.calls).toEqual([["test"]]);
});
