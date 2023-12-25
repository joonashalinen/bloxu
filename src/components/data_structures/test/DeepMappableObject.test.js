"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var DeepMappableObject_1 = require("../pub/DeepMappableObject");
var globals_1 = require("@jest/globals");
(0, globals_1.test)("map", function () {
    var wrappee = {
        a: { b: 1 },
        c: [{ d: 2 }],
        e: { f: { g: "value" } },
        h: [3]
    };
    var obj = new DeepMappableObject_1.default(wrappee);
    obj.map(function (value) { return typeof value === "number" ? value + 1 : value; });
    (0, globals_1.expect)(obj.wrappee).toEqual({
        a: { b: 2 },
        c: [{ d: 3 }],
        e: { f: { g: "value" } },
        h: [4]
    });
});
