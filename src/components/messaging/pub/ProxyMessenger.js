"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var EventEmitter_1 = require("../../events/pub/EventEmitter");
var ProxyMessenger = /** @class */ (function () {
    function ProxyMessenger() {
        this.emitter = new EventEmitter_1.default();
    }
    ProxyMessenger.prototype.postMessage = function (msg) {
        this.emitter.trigger("postMessage", [msg]);
        return this;
    };
    ProxyMessenger.prototype.onMessage = function (handler) {
        this.emitter.on("message", handler);
        return this;
    };
    ProxyMessenger.prototype.offMessage = function (handler) {
        this.emitter.off("message", handler);
        return this;
    };
    /**
     * Listen to calls to postMessage.
     */
    ProxyMessenger.prototype.onPostMessage = function (handler) {
        this.emitter.on("postMessage", handler);
        return this;
    };
    /**
     * Manually cause ProxyMessenger to send a message.
     */
    ProxyMessenger.prototype.message = function (msg) {
        this.emitter.trigger("message", [msg]);
        return this;
    };
    return ProxyMessenger;
}());
exports.default = ProxyMessenger;
