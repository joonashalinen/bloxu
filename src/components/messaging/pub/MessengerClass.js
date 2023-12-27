"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * A wrapper for a given class that implements IMessenger
 * by simply calling the class's methods and using an EventEmitter.
 * The EventEmitter is assumed to be such that the wrappee class
 * has access to it and can thus use it to trigger message events.
 */
var MessengerClass = /** @class */ (function () {
    function MessengerClass(wrappee, wrappeeEmitter, id) {
        if (id === void 0) { id = ""; }
        this.wrappee = wrappee;
        this.wrappeeEmitter = wrappeeEmitter;
        this.messageEvent = "message";
        this.id = id;
    }
    /**
     * Call a method on the wrapped class. If the class
     * returns a result value, it will be emitted as a response message.
     * The given msg is assumed to be of type "request".
     */
    MessengerClass.prototype._callMethod = function (msg) {
        return __awaiter(this, void 0, void 0, function () {
            var result, responseMsg;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, (_a = this.wrappee)[msg.message.type].apply(_a, msg.message.args)];
                    case 1:
                        result = _b.sent();
                        // If the result is not the wrapped class itself or undefined then we assume 
                        // that the result value matters and we send it as a response message.
                        if (result !== undefined &&
                            !(typeof result === "object" && result.constructor === this.wrappee.constructor)) {
                            responseMsg = {
                                sender: this.id,
                                recipient: msg.sender,
                                type: "response",
                                message: {
                                    type: msg.message.type,
                                    args: [result]
                                }
                            };
                            this.wrappeeEmitter.trigger(this.messageEvent, [responseMsg]);
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    MessengerClass.prototype.postMessage = function (msg) {
        var _a;
        if (msg.type === "request" &&
            typeof this.wrappee === "object" &&
            msg.message.type in this.wrappee) {
            this._callMethod(msg);
        }
        // Transform response message into event.
        if (msg.type === "response") {
            msg.type = "event";
            msg.message.type = "response:" + msg.message.type;
        }
        if (msg.type === "event") {
            if (typeof this.wrappee === "object" &&
                "eventHandlers" in this.wrappee &&
                typeof this.wrappee.eventHandlers === "object" &&
                msg.message.type in this.wrappee.eventHandlers) {
                (_a = this.wrappee.eventHandlers)[msg.message.type].apply(_a, msg.message.args);
            }
        }
        return this;
    };
    MessengerClass.prototype.onMessage = function (handler) {
        this.wrappeeEmitter.on(this.messageEvent, handler);
        return this;
    };
    return MessengerClass;
}());
exports.default = MessengerClass;
