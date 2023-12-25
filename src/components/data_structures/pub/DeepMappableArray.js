"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var DeepMappableObject_1 = require("./DeepMappableObject");
var VariableType_1 = require("../../types/VariableType");
/**
 * Provides deep mapping for plain javascript arrays.
 */
var DeepMappableArray = /** @class */ (function () {
    function DeepMappableArray(wrappee) {
        this.wrappee = wrappee;
    }
    DeepMappableArray.prototype.map = function (transformer) {
        this.wrappee = this.wrappee.map(function (value) {
            if (Array.isArray(value)) {
                return (new DeepMappableArray(value)).map(transformer).wrappee;
            }
            else if ((new VariableType_1.default(value)).isRealObject()) {
                return (new DeepMappableObject_1.default(value)).map(transformer).wrappee;
            }
            else {
                return transformer(value);
            }
        });
        return this;
    };
    return DeepMappableArray;
}());
exports.default = DeepMappableArray;
