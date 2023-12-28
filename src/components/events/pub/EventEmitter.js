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
var EventEmitter = /** @class */ (function () {
    function EventEmitter() {
        this._eventListeners = [];
        this._allowedEvents = [];
        this._allowAllEvents = true;
    }
    EventEmitter.prototype.allowAllEvents = function () {
        return this._allowAllEvents;
    };
    EventEmitter.prototype.setAllowAllEvents = function (allowAllEvents) {
        this._allowAllEvents = allowAllEvents;
    };
    EventEmitter.prototype._onEvent = function (event, callback) {
        if (this._allowAllEvents || this._allowedEvents.includes(event)) {
            this._eventListeners.push({
                event: event,
                callback: callback
            });
        }
    };
    EventEmitter.prototype._eventsFromEventString = function (eventsString) {
        return eventsString.split(" ").join("").split(",");
    };
    EventEmitter.prototype.on = function (eventsString, callback) {
        var events = this._eventsFromEventString(eventsString);
        for (var i = 0; i < events.length; i++) {
            this._onEvent(events[i], callback);
        }
    };
    EventEmitter.prototype.off = function (event, callback) {
        for (var i = this._eventListeners.length - 1; i >= 0; i--) {
            if (this._eventListeners[i].event === event
                &&
                    this._eventListeners[i].callback === callback) {
                this._eventListeners.splice(i, 1);
            }
        }
    };
    EventEmitter.prototype.trigger = function (event, args) {
        if (args === undefined)
            args = [];
        for (var i = 0; i < this._eventListeners.length; i++) {
            if (this._eventListeners[i].event === event) {
                this._eventListeners[i].callback.apply(null, args);
            }
        }
    };
    EventEmitter.prototype.triggerAwait = function (event, args) {
        return __awaiter(this, void 0, void 0, function () {
            var i;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (args === undefined)
                            args = [];
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < this._eventListeners.length)) return [3 /*break*/, 4];
                        if (!(this._eventListeners[i].event === event)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this._eventListeners[i].callback.apply(null, args)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    EventEmitter.prototype.allowedEvents = function () {
        return this._allowedEvents;
    };
    EventEmitter.prototype.setAllowedEvents = function (allowedEvents) {
        this._allowedEvents = allowedEvents;
    };
    EventEmitter.prototype.addAllowedEvent = function (event) {
        if (!this._allowedEvents.includes(event))
            this._allowedEvents.push(event);
    };
    EventEmitter.prototype.removeAllowedEvent = function (event) {
        if (this._allowedEvents.includes(event))
            this._allowedEvents.splice(this._allowedEvents.indexOf(event), 1);
    };
    return EventEmitter;
}());
exports.default = EventEmitter;
