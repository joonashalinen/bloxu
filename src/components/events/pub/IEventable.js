"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isEventable = void 0;
var EventEmitter_1 = require("./EventEmitter");
function isEventable(obj) {
    return "emitter" in obj && obj.emitter instanceof EventEmitter_1.default;
}
exports.isEventable = isEventable;
