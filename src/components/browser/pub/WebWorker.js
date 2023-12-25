"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var jsonfn_1 = require("jsonfn");
var DeepMappableObject_1 = require("../../data_structures/pub/DeepMappableObject");
var VariableType_1 = require("../../types/VariableType");
/**
 * A web worker running on a browser. Implements the IMessenger interface
 * and provides support for sending functions between workers.
 */
var WebWorker = /** @class */ (function () {
    function WebWorker(worker) {
        this.worker = worker;
        this.encodedFunctionPrefix = "#####";
    }
    /**
     * Maps every value of given type in given object.
     */
    WebWorker.prototype._mapTypeInObj = function (obj, type, transformer) {
        return ((new DeepMappableObject_1.default(obj)).map(function (value) { return (typeof value === type ?
            transformer(value) :
            value); }).wrappee);
    };
    /**
     * Encodes the given function into a string.
     */
    WebWorker.prototype.encodeFunction = function (f) {
        return this.encodedFunctionPrefix + jsonfn_1.JSONfn.stringify(f);
    };
    /**
     * Decodes a function that was stringified with .encodeFunction()
     * back into being a function.
     */
    WebWorker.prototype.decodeFunction = function (f) {
        return jsonfn_1.JSONfn.parse(f.slice(this.encodedFunctionPrefix.length));
    };
    WebWorker.prototype.postMessage = function (msg) {
        // Transform functions into a form where they can be
        // sent via the worker.
        if (typeof msg === "function") {
            msg = this.encodeFunction(msg);
        }
        else if (msg instanceof Object) {
            msg = this._mapTypeInObj(msg, "function", this.encodeFunction.bind(this));
        }
        this.worker.postMessage(msg);
        return this;
    };
    WebWorker.prototype.onMessage = function (handler) {
        var _this = this;
        this.worker.onmessage = function (msg) {
            // If msg.data is an object.
            if ((new VariableType_1.default(msg.data)).isRealObject()) {
                // Map all encoded functions back into real functions.
                var data = ((new DeepMappableObject_1.default(msg.data)).map(function (value) {
                    // If the value to be mapped is an encoded function.
                    if (typeof value === "string" &&
                        value.length >= _this.encodedFunctionPrefix.length &&
                        value.slice(0, _this.encodedFunctionPrefix.length) === _this.encodedFunctionPrefix) {
                        // Decode the string back into a real function.
                        return _this.decodeFunction(value);
                    }
                    else {
                        // Value to be mapped is not an encoded function. Thus, we do nothing to it.
                        return value;
                    }
                }).wrappee);
            }
            else {
                // msg.data is not an object. Thus, we do nothing to it.
                var data = msg.data;
            }
            handler(data);
        };
        return this;
    };
    return WebWorker;
}());
exports.default = WebWorker;
