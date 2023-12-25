"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var DeepMappableArray_1 = require("./DeepMappableArray");
var VariableType_1 = require("../../types/VariableType");
/**
 * Provides deep mapping for plain javascript objects.
 */
var DeepMappableObject = /** @class */ (function () {
    function DeepMappableObject(wrappee) {
        this.wrappee = wrappee;
    }
    /**
     * Deep map through all the object's values. Deep maps through nested arrays as well.
     */
    DeepMappableObject.prototype.map = function (transformer) {
        var copyObj = {};
        for (var propName in this.wrappee) {
            var prop = this.wrappee[propName];
            if (Array.isArray(prop)) {
                copyObj[propName] = (new DeepMappableArray_1.default(prop)).map(transformer).wrappee;
            }
            else if ((new VariableType_1.default(prop)).isRealObject()) {
                copyObj[propName] = (new DeepMappableObject(prop)).map(transformer).wrappee;
            }
            else {
                copyObj[propName] = transformer(prop);
            }
        }
        this.wrappee = copyObj;
        return this;
    };
    return DeepMappableObject;
}());
exports.default = DeepMappableObject;
