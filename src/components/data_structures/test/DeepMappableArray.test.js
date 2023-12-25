"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var DeepMappableArray_1 = require("../pub/DeepMappableArray");
var globals_1 = require("@jest/globals");
(0, globals_1.test)("map", function () {
    var wrappee = [{ a: 1 }, { b: [{ c: 2 }] }];
    var obj = new DeepMappableArray_1.default(wrappee);
    obj.map(function (value) { return typeof value === "number" ? value + 1 : value; });
    (0, globals_1.expect)(obj.wrappee).toEqual([{ a: 2 }, { b: [{ c: 3 }] }]);
});
