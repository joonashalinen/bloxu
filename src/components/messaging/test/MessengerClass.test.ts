import {describe, expect, test, jest} from '@jest/globals';
import {createMessenger, testMessages} from "./MessengerClassTesting";

test("postMessage", async () => {
    var [messenger, proxy, obj] = createMessenger();
    messenger.postMessage(testMessages.type1);
    
    await new Promise((resolve) => {
        setTimeout(() => {
            resolve(null);
        }, 1000);
    });
    
    expect(obj.test.mock.calls).toEqual([["test"]]);
});

test("onMessage", async () => {
    var [messenger, proxy, obj] = createMessenger();
    var onMessage = jest.fn();
    messenger.onMessage(onMessage);
    proxy.postMessage(testMessages.type1);

    await new Promise((resolve) => {
        setTimeout(() => {
            resolve(null);
        }, 1000);
    });
    
    expect(onMessage.mock.calls).toEqual([[testMessages.type1]]);
});