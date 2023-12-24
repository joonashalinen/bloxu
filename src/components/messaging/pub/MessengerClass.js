"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * A wrapper for a given class that implements IMessenger
 * by simply calling the class's methods and using an EventEmitter.
 * The EventEmitter is assumed to be such that the wrappee class
 * has access to it and can thus use it to trigger message events.
 */
var MessagerClass = /** @class */ (function () {
    function MessagerClass(wrappee, wrappeeEmitter, messageEvent) {
        if (messageEvent === void 0) { messageEvent = "message"; }
        this.wrappee = wrappee;
        this.wrappeeEmitter = wrappeeEmitter;
        this.messageEvent = messageEvent;
    }
    MessagerClass.prototype.postMessage = function (msg) {
        var _a;
        (_a = this.wrappee)[msg.method].apply(_a, msg.args);
        return this;
    };
    MessagerClass.prototype.onMessage = function (handler) {
        this.wrappeeEmitter.on(this.messageEvent, handler);
        return this;
    };
    return MessagerClass;
}());
exports.default = MessagerClass;
