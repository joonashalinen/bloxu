"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var WebWorker_1 = require("../pub/WebWorker");
var globals_1 = require("@jest/globals");
// Mock BrowserWebWorker
var MockWorker = /** @class */ (function () {
    function MockWorker() {
        this.postMessage = globals_1.jest.fn();
        this.onmessage = function () { };
    }
    return MockWorker;
}());
(0, globals_1.describe)('WebWorker', function () {
    var mockWorker;
    var webWorker;
    (0, globals_1.beforeEach)(function () {
        mockWorker = new MockWorker();
        webWorker = new WebWorker_1.default(mockWorker);
    });
    (0, globals_1.test)('postMessage with a function should encode it', function () {
        var originalFunction = function (a, b) { return a + b; };
        webWorker.postMessage(originalFunction);
        // Assert that postMessage was called with the encoded function
        (0, globals_1.expect)(mockWorker.postMessage).toHaveBeenCalledWith(webWorker.encodeFunction(originalFunction));
    });
    (0, globals_1.test)('postMessage with an object should encode functions within it', function () {
        var originalObject = {
            func1: function (x) { return x * 2; },
            func2: function (y) { return y.toUpperCase(); },
            data: 42,
        };
        webWorker.postMessage(originalObject);
        // Assert that postMessage was called with the encoded functions in the object
        (0, globals_1.expect)(mockWorker.postMessage).toHaveBeenCalledWith({
            func1: webWorker.encodeFunction(originalObject.func1),
            func2: webWorker.encodeFunction(originalObject.func2),
            data: 42,
        });
    });
    (0, globals_1.test)('onMessage should decode a function in the received data', function () {
        var encodedFunction = webWorker.encodeFunction(function (x) { return x * 2; });
        var receivedData = {
            result: encodedFunction,
            otherValue: 'test',
        };
        var checkMsg = globals_1.jest.fn(function (data) {
            // Assert that the handler received the decoded function
            (0, globals_1.expect)(data.result).toBeInstanceOf(Function);
            var f = data.result;
            (0, globals_1.expect)(f(2)).toBe(4);
        });
        webWorker.onMessage(checkMsg);
        // Mock the onmessage event
        mockWorker.onmessage({ data: receivedData });
        (0, globals_1.expect)(checkMsg).toHaveBeenCalledTimes(1);
    });
    (0, globals_1.test)('onMessage should handle non-function objects in the received data', function () {
        var receivedData = {
            result: { key: 'value' },
            otherValue: 'test',
        };
        var checkMsg = globals_1.jest.fn(function (data) {
            // Assert that the handler received the non-function object as is
            (0, globals_1.expect)(data.result).toEqual({ key: 'value' });
        });
        webWorker.onMessage(checkMsg);
        // Mock the onmessage event
        mockWorker.onmessage({ data: receivedData });
        (0, globals_1.expect)(checkMsg).toHaveBeenCalledTimes(1);
    });
});
