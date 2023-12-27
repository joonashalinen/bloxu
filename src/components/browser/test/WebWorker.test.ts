import WebWorker, { BrowserWebWorker } from '../pub/WebWorker';
import {describe, expect, test, jest, beforeEach} from '@jest/globals';

// Mock BrowserWebWorker
class MockWorker implements BrowserWebWorker {
    postMessage = jest.fn();
    onmessage: Function = () => {};
}

describe('WebWorker', () => {
    let mockWorker: MockWorker;
    let webWorker: WebWorker<unknown, unknown>;

    beforeEach(() => {
        mockWorker = new MockWorker();
        webWorker = new WebWorker(mockWorker);
    });

    test('postMessage with a function should encode it', () => {
        const originalFunction = (a: number, b: number) => a + b;
        webWorker.postMessage(originalFunction);

        // Assert that postMessage was called with the encoded function
        expect(mockWorker.postMessage).toHaveBeenCalledWith(
            webWorker.encodeFunction(originalFunction)
        );
    });

    test('postMessage with an object should encode functions within it', () => {
        const originalObject = {
            func1: (x: number) => x * 2,
            func2: (y: string) => y.toUpperCase(),
            data: 42,
        };
        webWorker.postMessage(originalObject);

        // Assert that postMessage was called with the encoded functions in the object
        expect(mockWorker.postMessage).toHaveBeenCalledWith({
            func1: webWorker.encodeFunction(originalObject.func1),
            func2: webWorker.encodeFunction(originalObject.func2),
            data: 42,
        });
    });

    test('onMessage should decode a function in the received data', () => {
        const encodedFunction = webWorker.encodeFunction((x: number) => x * 2);

        const receivedData = {
            result: encodedFunction,
            otherValue: 'test',
        };

        var checkMsg = jest.fn((data: typeof receivedData) => {
            // Assert that the handler received the decoded function
            expect(data.result).toBeInstanceOf(Function);
            var f = (data.result as unknown as Function);
            expect(f(2)).toBe(4);
        });

        webWorker.onMessage(checkMsg);
        // Mock the onmessage event
        mockWorker.onmessage({ data: receivedData });
        expect(checkMsg).toHaveBeenCalledTimes(1);
    });

    test('onMessage should handle non-function objects in the received data', () => {
        const receivedData = {
            result: { key: 'value' },
            otherValue: 'test',
        };

        var checkMsg = jest.fn((data: typeof receivedData) => {
            // Assert that the handler received the non-function object as is
            expect(data.result).toEqual({ key: 'value' });
        });

        webWorker.onMessage(checkMsg);
        // Mock the onmessage event
        mockWorker.onmessage({ data: receivedData });
        expect(checkMsg).toHaveBeenCalledTimes(1);
    });
});
