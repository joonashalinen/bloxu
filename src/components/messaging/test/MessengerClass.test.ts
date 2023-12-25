import {describe, expect, test, jest} from '@jest/globals';
import {createMessenger, testMessages} from "./MessengerClassTesting";

test("postMessage", () => {
    var [messenger, emitter, obj] = createMessenger();
    messenger.postMessage(testMessages.type1)
    expect(obj.test.mock.calls).toEqual([["test"]]);
});

test("onMessage", () => {
    var [messenger, emitter, obj] = createMessenger();
    var onMessage = jest.fn();
    messenger.onMessage(onMessage);
    emitter.trigger("message", ["test"])
    expect(onMessage.mock.calls).toEqual([["test"]]);
});