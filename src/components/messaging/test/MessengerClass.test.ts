import {describe, expect, test, jest} from '@jest/globals';
import {createMessenger} from "./types";

test("postMessage", () => {
    var [messenger, emitter, obj] = createMessenger();
    messenger.postMessage({method: "test", args: ["test"]})
    expect(obj.test.mock.calls).toEqual([["test"]]);
});

test("onMessage", () => {
    var [messenger, emitter, obj] = createMessenger();
    var onMessage = jest.fn();
    messenger.onMessage(onMessage);
    emitter.trigger("message", ["test"])
    expect(onMessage.mock.calls).toEqual([["test"]]);
});