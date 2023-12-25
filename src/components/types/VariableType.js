"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Provides utilities for testing the type of a variable.
 */
var VariableType = /** @class */ (function () {
    function VariableType(variable) {
        this.variable = variable;
    }
    VariableType.prototype.isNothing = function () {
        return (this.variable === null || this.variable === undefined);
    };
    VariableType.prototype.isRealPrimitive = function () {
        return !this.isNothing() && !this.isObject() && !this.isFunction();
    };
    VariableType.prototype.isPrimitive = function () {
        return !this.isObject() && !this.isFunction();
    };
    VariableType.prototype.isFunction = function () {
        return typeof this.variable === "function";
    };
    VariableType.prototype.isObject = function () {
        return typeof this.variable === "object";
    };
    VariableType.prototype.isDataStructure = function () {
        return this.isRealObject() || this.isArray();
    };
    VariableType.prototype.isRealObject = function () {
        return this.isObject() && !this.isNothing() && !this.isFunction() && !this.isArray();
    };
    VariableType.prototype.isArray = function () {
        return Array.isArray(this.variable);
    };
    VariableType.prototype.isInstanceOf = function (classType) {
        return (this.variable instanceof classType);
    };
    return VariableType;
}());
exports.default = VariableType;
