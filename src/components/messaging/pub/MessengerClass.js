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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var EventEmitter_1 = require("../../events/pub/EventEmitter");
/**
 * A wrapper for a given class that implements IMessenger
 * by simply calling the class's methods and using a ProxyMessenger.
 * The ProxyMessenger is assumed to be such that the wrappee class
 * has access to it and can thus use it to send and receive messages to and from MessengerClass.
 */
var MessengerClass = /** @class */ (function () {
    function MessengerClass(wrappee, proxyMessenger, id) {
        if (id === void 0) { id = ""; }
        var _this = this;
        this.wrappee = wrappee;
        this.proxyMessenger = proxyMessenger;
        this.id = id;
        this.emitter = new EventEmitter_1.default();
        proxyMessenger.onPostMessage(function (msg) { return _this.emitter.trigger("message", [msg]); });
    }
    /**
     * Call a method on the wrapped class. If the class
     * returns a result value, it will be emitted as a response message.
     * The given msg is assumed to be of type "request".
     */
    MessengerClass.prototype._callMethod = function (msg) {
        return __awaiter(this, void 0, void 0, function () {
            var result, e_1, responseMsg;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, (_a = this.wrappee)[msg.message.type].apply(_a, __spreadArray(__spreadArray([], msg.message.args, false), [msg], false))];
                    case 1:
                        result = _b.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        e_1 = _b.sent();
                        result = { error: e_1.toString() };
                        return [3 /*break*/, 3];
                    case 3:
                        // If the result is not the wrapped class itself or undefined then we assume 
                        // that the result value matters and we send it as a response message.
                        if (result !== undefined &&
                            !(typeof result === "object" && result.constructor === this.wrappee.constructor)) {
                            responseMsg = {
                                sender: this.id,
                                recipient: msg.sender,
                                id: msg.id,
                                type: "response",
                                message: {
                                    type: msg.message.type,
                                    args: [result]
                                }
                            };
                            this.emitter.trigger("message", [responseMsg]);
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
        else if (msg.type === "response") {
            this.proxyMessenger.message(msg);
        }
        else if (msg.type === "event") {
            if (typeof this.wrappee === "object" &&
                "eventHandlers" in this.wrappee &&
                typeof this.wrappee.eventHandlers === "object") {
                // If the event type has a direct handler in the service class, 
                // we use it by default.
                if (msg.message.type in this.wrappee.eventHandlers) {
                    (_a = this.wrappee.eventHandlers)[msg.message.type].apply(_a, __spreadArray(__spreadArray([], msg.message.args, false), [msg], false));
                }
                else if (typeof this.wrappee.eventHandlers["*"] === "function") {
                    // Else, if the service class has a fallback event handler for 
                    // all events, we use that.
                    this.wrappee.eventHandlers["*"](msg);
                }
            }
        }
        return this;
    };
    MessengerClass.prototype.onMessage = function (handler) {
        this.emitter.on("message", handler);
        return this;
    };
    MessengerClass.prototype.offMessage = function (handler) {
        this.emitter.off("message", handler);
        return this;
    };
    return MessengerClass;
}());
exports.default = MessengerClass;
