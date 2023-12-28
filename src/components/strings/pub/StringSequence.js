"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * A sequence of string values.
 */
var StringSequence = /** @class */ (function () {
    function StringSequence(wrappee) {
        this.wrappee = wrappee;
        this.prefix = "";
        this.suffix = "";
    }
    StringSequence.prototype.current = function () {
        return this.prefix + this.wrappee.current().toString() + this.suffix;
    };
    StringSequence.prototype.next = function () {
        return this.prefix + this.wrappee.next().toString() + this.suffix;
    };
    return StringSequence;
}());
exports.default = StringSequence;
