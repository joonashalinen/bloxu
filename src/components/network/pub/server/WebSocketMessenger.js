"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var WebSocketMessenger = /** @class */ (function () {
    function WebSocketMessenger(socket) {
        this.messageHandlers = [];
        this.ws = socket;
        this.setupWebSocket();
    }
    WebSocketMessenger.prototype.setupWebSocket = function () {
        var _this = this;
        this.ws.on('message', function (data) {
            try {
                var parsedData_1 = JSON.parse(data.toString());
                _this.messageHandlers.forEach(function (handler) { return handler(parsedData_1); });
            }
            catch (error) {
                throw new Error('Error parsing incoming message:' + error);
            }
        });
    };
    WebSocketMessenger.prototype.postMessage = function (msg) {
        try {
            var serializedMsg = JSON.stringify(msg);
            this.ws.send(serializedMsg);
        }
        catch (error) {
            throw new Error('Error sending message: ' + error);
        }
        return this;
    };
    WebSocketMessenger.prototype.onMessage = function (handler) {
        this.messageHandlers.push(handler);
        return this;
    };
    return WebSocketMessenger;
}());
exports.default = WebSocketMessenger;
