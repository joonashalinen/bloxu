"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var globals_1 = require("@jest/globals");
var types_1 = require("./types");
(0, globals_1.test)("postMessage", function () {
    var _a = (0, types_1.createMessenger)(), messenger = _a[0], emitter = _a[1], obj = _a[2];
    messenger.postMessage({ method: "test", args: ["test"] });
    (0, globals_1.expect)(obj.test.mock.calls).toEqual([["test"]]);
});
(0, globals_1.test)("onMessage", function () {
    var _a = (0, types_1.createMessenger)(), messenger = _a[0], emitter = _a[1], obj = _a[2];
    var onMessage = globals_1.jest.fn();
    messenger.onMessage(onMessage);
    emitter.trigger("message", ["test"]);
    (0, globals_1.expect)(onMessage.mock.calls).toEqual([["test"]]);
});
